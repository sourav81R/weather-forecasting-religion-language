from __future__ import annotations

import math
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any

import numpy as np

try:
    from sentence_transformers import SentenceTransformer
except Exception:  # pragma: no cover - optional dependency
    SentenceTransformer = None


WORD_RE = re.compile(r"[a-z0-9]{2,}")


@dataclass
class KnowledgeDocument:
    doc_id: str
    title: str
    source: str
    text: str


class WeatherRAGService:
    def __init__(self) -> None:
        self.knowledge_dir = Path(__file__).resolve().parent.parent / "knowledge"
        self.documents = self._load_documents()
        self.embedding_model_name = "sentence-transformers/all-MiniLM-L6-v2"
        self.embedding_model = None
        self.document_embeddings: np.ndarray | None = None
        self._embedding_error: str | None = None
        self._ensure_embeddings_if_possible()

    def retrieve(self, query: str, limit: int = 3) -> list[dict[str, Any]]:
        clean_query = str(query or "").strip()
        if not clean_query or not self.documents:
            return []

        if self.embedding_model is not None and self.document_embeddings is not None:
            try:
                return self._semantic_search(clean_query, limit=limit)
            except Exception:
                pass
        return self._keyword_search(clean_query, limit=limit)

    def _load_documents(self) -> list[KnowledgeDocument]:
        if not self.knowledge_dir.exists():
            return []

        documents: list[KnowledgeDocument] = []
        for path in sorted(self.knowledge_dir.glob("*.md")):
            text = path.read_text(encoding="utf-8").strip()
            if not text:
                continue
            title = self._extract_title(text, fallback=path.stem.replace("_", " ").title())
            documents.append(
                KnowledgeDocument(
                    doc_id=path.stem,
                    title=title,
                    source=path.name,
                    text=text,
                )
            )
        return documents

    def _ensure_embeddings_if_possible(self) -> None:
        if SentenceTransformer is None or not self.documents:
            return
        try:
            self.embedding_model = SentenceTransformer(self.embedding_model_name)
            embeddings = self.embedding_model.encode(
                [doc.text for doc in self.documents],
                normalize_embeddings=True,
                convert_to_numpy=True,
            )
            self.document_embeddings = np.asarray(embeddings, dtype=np.float32)
        except Exception as exc:  # pragma: no cover - depends on optional runtime
            self.embedding_model = None
            self.document_embeddings = None
            self._embedding_error = str(exc)

    def _semantic_search(self, query: str, limit: int) -> list[dict[str, Any]]:
        if self.embedding_model is None or self.document_embeddings is None:
            return []

        query_embedding = self.embedding_model.encode(query, normalize_embeddings=True, convert_to_numpy=True)
        scores = np.dot(self.document_embeddings, np.asarray(query_embedding, dtype=np.float32))
        top_indices = np.argsort(scores)[::-1][: max(1, min(int(limit), len(self.documents)))]

        results = []
        for index in top_indices:
            score = float(scores[index])
            if score <= 0.18:
                continue
            doc = self.documents[int(index)]
            results.append(
                {
                    "id": doc.doc_id,
                    "title": doc.title,
                    "source": doc.source,
                    "score": round(score, 4),
                    "snippet": self._snippet_for_query(doc.text, query),
                }
            )
        return results

    def _keyword_search(self, query: str, limit: int) -> list[dict[str, Any]]:
        query_tokens = set(WORD_RE.findall(query.lower()))
        if not query_tokens:
            return []

        scored: list[tuple[float, KnowledgeDocument]] = []
        for doc in self.documents:
            doc_tokens = WORD_RE.findall(doc.text.lower())
            if not doc_tokens:
                continue
            token_counts: dict[str, int] = {}
            for token in doc_tokens:
                token_counts[token] = token_counts.get(token, 0) + 1
            overlap = 0.0
            for token in query_tokens:
                overlap += 1.0 + min(token_counts.get(token, 0), 3) * 0.25
            if overlap <= 0:
                continue
            score = overlap / math.sqrt(len(doc_tokens))
            scored.append((score, doc))

        scored.sort(key=lambda item: item[0], reverse=True)
        results = []
        for score, doc in scored[: max(1, min(int(limit), len(scored)))]:
            results.append(
                {
                    "id": doc.doc_id,
                    "title": doc.title,
                    "source": doc.source,
                    "score": round(float(score), 4),
                    "snippet": self._snippet_for_query(doc.text, query),
                }
            )
        return results

    @staticmethod
    def _extract_title(text: str, fallback: str) -> str:
        for line in text.splitlines():
            clean = line.strip()
            if clean.startswith("#"):
                return clean.lstrip("#").strip() or fallback
        return fallback

    @staticmethod
    def _snippet_for_query(text: str, query: str, max_length: int = 380) -> str:
        clean_text = " ".join(str(text or "").split())
        if len(clean_text) <= max_length:
            return clean_text

        query_tokens = [token for token in WORD_RE.findall(query.lower()) if token]
        lowered = clean_text.lower()
        best_position = 0
        for token in query_tokens:
            position = lowered.find(token)
            if position >= 0:
                best_position = max(0, position - max_length // 5)
                break

        snippet = clean_text[best_position:best_position + max_length].strip()
        if best_position > 0:
            snippet = f"... {snippet}"
        if best_position + max_length < len(clean_text):
            snippet = f"{snippet} ..."
        return snippet


rag_service = WeatherRAGService()
