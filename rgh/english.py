from tkinter import *
import tkinter as tk
from tkinter import messagebox
from googletrans import Translator
import requests
import json
import os

HEIGHT=400
WIDTH=800

def translate_to_bengali(text):
    translator = Translator()
    translated_text = translator.translate(text, src='en', dest='bn')
    return translated_text.text

def get_weather(city_name, api_key):
    url = f"http://api.openweathermap.org/data/2.5/weather?q={city_name}&appid={api_key}&units=metric"
    response = requests.get(url)
    data = response.json()
    if response.status_code == 200:
        weather_info = {
            "city": data["name"],
            "temperature": data["main"]["temp"],
            "description": data["weather"][0]["description"],
            "humidity": data["main"]["humidity"],
            "wind_speed": data["wind"]["speed"],
        }
        return weather_info
    else:
        messagebox.showerror("Error", f"Failed to fetch weather data: {data['message']}")
        return None

def display_weather():
    city_name = city_entry.get()
    if city_name.strip() == "":
        messagebox.showerror("Error", "Please enter a city name")
        return

    api_key = '48a90ac42caa09f90dcaeee4096b9e53'
    weather_info = get_weather(city_name, api_key)

    
    if weather_info:
        weather_display.config(text=f"{weather_info['city']} Weather:\n"
                                    f"Temperature: {weather_info['temperature']}°C\n"
                                    f"Description: {weather_info['description']}\n"
                                    f"Humidity: {weather_info['humidity']}%\n"
                                    f"Wind Speed: {weather_info['wind_speed']} m/s")
    else:
        weather_display.config(text="Weather information not available.")
        
root = tk.Tk()
root.title("weatherB")

background_img = PhotoImage(fil=r"D:\projectW\rgh\pic.png")
Label(root,image=background_img).place(relx=0,rely=0,relwidth=1,relheight=1)

icon_image = tk.PhotoImage(file="D:\projectW\weatherB- icon.png")
root.iconphoto(True, icon_image)

city_label = Label(root, text="Enter City: ")
city_label.pack()

city_entry = Entry(root)
city_entry.pack()


fetch_button = Button(root, text="Fetch Weather", command=display_weather)
fetch_button.pack()

weather_display = Label(root, text="", font=("Arial", 12), wraplength=300, justify=LEFT)
weather_display.pack()




root.mainloop()




# app = tk.Tk()
# app.title("Weather App")

# app.iconbitmap(r"D:\projectW\rgh\weatherB- icon.png")

# canvas = Canvas(app, height=HEIGHT, width=WIDTH)
# canvas.pack()

# background_img = PhotoImage(file=r"D:\projectW\rgh\pic.gif")
# canvas.create_image(0, 0, anchor=NW, image=background_img)

# upper_frame = Frame(app, bg='white')
# upper_frame.place(relx=0.5, rely=0.1, relwidth=0.75, relheight=0.1, anchor="n")

# city_label = tk.Label(upper_frame, text="Enter City:", bg='white')
# city_label.grid(row=0, column=0, padx=5, pady=5)


# city_entry = tk.Entry(upper_frame, bg="white")
# city_entry.grid(row=0, column=1, padx=(25,5), pady=5)

# fetch_button = tk.Button(app, text="Fetch Weather", command=fetch_weather)
# fetch_button.place(relx=0.5, rely=0.25, relwidth=0.75, anchor="n")

# weather_display = tk.Label(app, text="", wraplength=300)
# weather_display.place(relx=0.5, rely=0.35, relwidth=0.75, anchor="n")

# app.mainloop()