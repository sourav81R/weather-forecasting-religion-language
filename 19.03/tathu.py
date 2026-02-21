from tkinter import *
import requests
from googletrans import Translator
from tkinter import messagebox

HEIGHT=400
WIDTH=800

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

def display_weather():
    city_name = city_entry.get()

    weather_data = fetch_weather(city_name, API_KEY)  # Pass both city_name and API_KEY
    if weather_data:
        temperature = weather_data['main']['temp']
        description = weather_data['weather'][0]['description']
        humidity = weather_data['main']['humidity']
        wind_speed = weather_data['wind']['speed']

        translated_description = translate_to_bengali(description)

        result_label.config(text=f"তাপমাত্রা: {temperature}°C\n"
                                  f"বর্ণনা: {translated_description}\n"
                                  f"আর্দ্রতা: {humidity}%\n"
                                  f"বায়ু বেগ: {wind_speed} m/s")
    else:
        result_label.config(text="আবহাওয়া তথ্য পাওয়া যায়নি.")

# GUI setup
root = Tk()
root.title("Weather App")


background_img = PhotoImage(file=r"C:\Users\SWARUP\Downloads\balll\pic.gif")
Label(root,image=background_img).place(relx=0,rely=0,relwidth=1,relheight=1)

city_label = Label(root, text="শহরের নাম: ")
city_label.pack()

city_entry = Entry(root)
city_entry.pack()


fetch_button = Button(root, text="তথ্য প্রাপ্ত করুন", command=display_weather)
fetch_button.pack()

result_label = Label(root, text="", font=("Arial", 12), wraplength=300, justify=LEFT)
result_label.pack()


# upper_frame = Frame(root,bg='white')
# upper_frame.place(relx=0.5,rely=0.1,relwidth=0.75,relheight=0.1,anchor="n")

# entry=Entry(upper_frame,bg="white",bd=0)
# entry.place(relx=0,rely=0,relwidth=0.7,relheight=1)
# # search_button = Button(upper_frame, text="search", font=40, bd=0, bg="#f2f2f2", command=lambda: start_thread())

# lower_frame=Frame(root,bg="black",bd=3)
# lower_frame.place(relx=0.5,rely=0.3,relwidth=0.75,relheight=0.65,anchor="n")

# show=Label(lower_frame,bg="#f2f2f2",font=40,)
# show.place(relx=0,rely=0,relwidth=1,relheight=1)

root.mainloop()


