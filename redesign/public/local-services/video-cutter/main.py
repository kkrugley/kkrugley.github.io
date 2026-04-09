import os
import threading
import tkinter as tk
from tkinter import filedialog, ttk
from moviepy.video.io.VideoFileClip import VideoFileClip

def split_video_into_clips(input_file, output_folder, clip_duration=600):
    try:
        # Создаем папку для выходных файлов, если её нет
        if not os.path.exists(output_folder):
            os.makedirs(output_folder)

        # Открываем видеофайл
        video = VideoFileClip(input_file)
        total_duration = video.duration  # Получаем общую длительность видео
        base_name = os.path.splitext(os.path.basename(input_file))[0]  # Базовое имя файла без расширенияa

        # Обновляем максимальное значение прогресс-бара
        progress_bar['maximum'] = int(total_duration)

        # Разделяем видео на фрагменты
        for i in range(0, int(total_duration), clip_duration):
            start_time = i
            end_time = min(i + clip_duration, total_duration)  # Не выходим за пределы общей длительности
            clip = video.subclip(start_time, end_time)  # Создаем подклип
            output_file = os.path.join(output_folder, f"{base_name}_part_{i // clip_duration + 1}.mp4")
            clip.write_videofile(output_file, codec="libx264", audio_codec="aac")  # Сохраняем подклип

            # Обновляем прогресс-бар
            progress_bar['value'] = i
            status_label.config(text=f"Создан файл: {os.path.basename(output_file)}")
            root.update_idletasks()

        # Завершение процесса
        progress_bar['value'] = total_duration
        status_label.config(text="Разделение завершено!")
    except Exception as e:
        status_label.config(text=f"Ошибка: {str(e)}")
    finally:
        # Включаем кнопки после завершения
        input_button.config(state=tk.NORMAL)
        output_button.config(state=tk.NORMAL)
        start_button.config(state=tk.NORMAL)

def select_input_file():
    file_path = filedialog.askopenfilename(
        title="Выберите видеофайл",
        filetypes=[("MKV Files", "*.mkv"), ("All Files", "*.*")]
    )
    if file_path:
        input_entry.delete(0, tk.END)
        input_entry.insert(0, file_path)

def select_output_folder():
    folder_path = filedialog.askdirectory(title="Выберите папку для сохранения")
    if folder_path:
        output_entry.delete(0, tk.END)
        output_entry.insert(0, folder_path)

def start_splitting():
    input_file = input_entry.get().strip()
    output_folder = output_entry.get().strip()

    if not input_file or not output_folder:
        status_label.config(text="Пожалуйста, укажите входной файл и выходную папку.")
        return

    # Отключаем кнопки во время выполнения
    input_button.config(state=tk.DISABLED)
    output_button.config(state=tk.DISABLED)
    start_button.config(state=tk.DISABLED)

    # Запускаем процесс в отдельном потоке
    threading.Thread(target=lambda: split_video_into_clips(input_file, output_folder)).start()

# Создание главного окна
root = tk.Tk()
root.title("Разделение видео")
root.geometry("500x300")

# Элементы интерфейса
tk.Label(root, text="Входной файл:").pack(pady=5)
input_entry = tk.Entry(root, width=50)
input_entry.pack(pady=5)
input_button = tk.Button(root, text="Выбрать файл", command=select_input_file)
input_button.pack(pady=5)

tk.Label(root, text="Выходная папка:").pack(pady=5)
output_entry = tk.Entry(root, width=50)
output_entry.pack(pady=5)
output_button = tk.Button(root, text="Выбрать папку", command=select_output_folder)
output_button.pack(pady=5)

start_button = tk.Button(root, text="Начать разделение", command=start_splitting)
start_button.pack(pady=15)

progress_bar = ttk.Progressbar(root, orient="horizontal", length=400, mode="determinate")
progress_bar.pack(pady=10)

status_label = tk.Label(root, text="", fg="green")
status_label.pack(pady=10)

# Запуск основного цикла
root.mainloop()