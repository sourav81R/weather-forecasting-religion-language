import requests
from kivy.app import App
from kivy.uix.boxlayout import BoxLayout
from kivy.uix.label import Label
from kivy.uix.textinput import TextInput
from kivy.uix.button import Button
from googletrans import Translator
from kivy.uix.image import Image

# OpenWeatherMap API key
API_KEY = 'd7842c0b970d897c608c64e6b6cc0b8a'

def fetch_weather(city_name, api_key):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={api_key}&units=metric"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an error for bad response status codes
        data = response.json()
        return data
    except requests.exceptions.RequestException as e:
        print("Error making request:", e)
        return None
    except Exception as e:
        print("An error occurred:", e)
        return None

def translate_to_bengali(text):
    translator = Translator()
    translated_text = translator.translate(text, src='en', dest='bn')
    return translated_text.text

class WeatherApp(App):
    def build(self):
        layout = BoxLayout(orientation='vertical')

        background_img = Image(source="D:\projectW\weatherB\pic.png", allow_stretch=True, keep_ratio=False)
        layout.add_widget(background_img)
        
        self.icon = "D:\projectW\weatherB\weatherB- icon.png"
        
        self.city_label = Label(text="শহরের নাম:")
        layout.add_widget(self.city_label)

        self.city_entry = TextInput()
        layout.add_widget(self.city_entry)

        self.fetch_button = Button(text="তথ্য প্রাপ্ত করুন")
        self.fetch_button.bind(on_press=self.display_weather)
        layout.add_widget(self.fetch_button)

        self.result_label = Label(text="", font_size=20, size_hint_y=None, height=300)
        layout.add_widget(self.result_label)

        return layout

    def display_weather(self, instance):
        city_name = self.city_entry.text

        weather_data = fetch_weather(city_name, API_KEY)
        if weather_data:
            temperature = weather_data['main']['temp']
            description = weather_data['weather'][0]['description']
            humidity = weather_data['main']['humidity']
            wind_speed = weather_data['wind']['speed']

            translated_description = translate_to_bengali(description)

            self.result_label.text = f"তাপমাত্রা: {temperature}°C\n" \
                                      f"বর্ণনা: {translated_description}\n" \
                                      f"আর্দ্রতা: {humidity}%\n" \
                                      f"বায়ু বেগ: {wind_speed} m/s"
        else:
            self.result_label.text = "আবহাওয়া তথ্য পাওয়া যায়নি."

if __name__ == '__main__':
    WeatherApp().run()
