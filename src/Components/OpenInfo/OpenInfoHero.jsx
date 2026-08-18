import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import ReactLoading from "react-loading";

export default function OpenInfoHero() {
    const { i18n } = useTranslation();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    const getInfo = async () => {
        try {
            const response = await axios.get(`/open-datas`);
            setData(response?.data?.data || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Функция скачивания без прямого запроса через axios
    const downloadFile = (url, filename) => {
        try {
            // Создаем невидимый iframe для загрузки
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            // Создаем форму внутри iframe для отправки POST запроса
            const form = document.createElement('form');
            form.method = 'GET';
            form.action = url;
            iframe.appendChild(form);

            // Добавляем поле для имени файла (может быть обработано на сервере)
            const fileNameInput = document.createElement('input');
            fileNameInput.name = 'filename';
            fileNameInput.value = filename || 'file.pdf';
            form.appendChild(fileNameInput);

            // Отправляем форму
            form.submit();

            // Удаляем iframe через некоторое время
            setTimeout(() => {
                document.body.removeChild(iframe);
            }, 5000);
        } catch (error) {
            console.error("Ошибка при скачивании файла:", error);

            // Запасной вариант - открыть в новой вкладке
            window.open(url, '_blank');
        }
    };

    // Альтернативный метод с перенаправлением
    const downloadViaRedirect = (url, filename) => {
        // Создаём ссылку напрямую на файл без запроса
        window.location.href = url;
    };

    useEffect(() => {
        getInfo();
    }, []);

    return (
        <section className="my-[30px]">
            <div className="Container">
                <div className="flex items-center justify-center flex-col gap-[24px] w-full">
                    {loading ? (
                        <ReactLoading type="spinningBubbles" color="#000" height={100} width={100} />
                    ) : data.length === 0 ? (
                        <h4>Malumot yo'q</h4>
                    ) : (
                        data.map((item) => (
                            <div
                                key={item.id}
                                className="w-full border-[1px] px-[24px] py-[18px] bg-white cursor-pointer duration-500 hover:shadow-lg rounded-[8px] flex items-center gap-[10px] justify-between"
                            >
                                <div>
                                    <span>{item?.name?.[i18n.language] || "Noma'lum ma'lumot"}</span>
                                </div>
                                <div className="flex items-center gap-[10px]">
                                    <a href={item?.file[0]?.url || item?.url} target="_blank" rel="noopener noreferrer">
                                        <div className="text-[#A4A7AE] text-[30px]">
                                            <svg
                                                width="20px"
                                                height="20px"
                                                viewBox="0 0 20 20"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                            >
                                                <path
                                                    d="M19 7.00001L19 1.00001M19 1.00001H13M19 1.00001L10 10M8 1H5.8C4.11984 1 3.27976 1 2.63803 1.32698C2.07354 1.6146 1.6146 2.07354 1.32698 2.63803C1 3.27976 1 4.11984 1 5.8V14.2C1 15.8802 1 16.7202 1.32698 17.362C1.6146 17.9265 2.07354 18.3854 2.63803 18.673C3.27976 19 4.11984 19 5.8 19H14.2C15.8802 19 16.7202 19 17.362 18.673C17.9265 18.3854 18.3854 17.9265 18.673 17.362C19 16.7202 19 15.8802 19 14.2V12"
                                                    stroke="#A4A7AE"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                        </div>
                                    </a>
                                    <button
                                        onClick={() => {
                                            // Путь к файлу
                                            const fileUrl = item?.file[0]?.url || item?.url;
                                            // Имя файла для скачивания
                                            const fileName = `${item?.name?.[i18n.language] || "file"}.pdf`;

                                            // Пробуем прямой способ скачивания через тег <a> - обходит CORS
                                            const link = document.createElement('a');
                                            link.href = fileUrl;
                                            link.download = fileName;
                                            link.target = '_blank';
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }}
                                        className="text-[#A4A7AE] text-[30px] mb-[2px] bg-transparent border-0 cursor-pointer"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M12 15.575q-.2 0-.375-.062T11.3 15.3l-3.6-3.6q-.3-.3-.288-.7t.288-.7q.3-.3.713-.312t.712.287L11 12.15V5q0-.425.288-.712T12 4t.713.288T13 5v7.15l1.875-1.875q.3-.3.713-.288t.712.313q.275.3.288.7t-.288.7l-3.6 3.6q-.15.15-.325.213t-.375.062M6 20q-.825 0-1.412-.587T4 18v-2q0-.425.288-.712T5 15t.713.288T6 16v2h12v-2q0-.425.288-.712T19 15t.713.288T20 16v2q0 .825-.587 1.413T18 20z"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}