import axios from "axios";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import foto from "../../img/direktor.png";
import { commonAlert, sweetAlert } from "../../utils/sweetalert";

export default function UserMessage() {
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [fileName, setFileName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);
  const { i18n } = useTranslation();
  const { t } = useTranslation();
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    region: "",
    district: "",
    city: "",
    fullName: "",
    phone: "",
    email: "",
    message: "",
    file: null,
  });

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      // Faylni tekshirish (max 5MB va ruxsat etilgan formatlar)
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];
      if (!allowedTypes.includes(file.type)) {
        setError("Faqat .doc, .pdf, .xls fayllarga ruxsat beriladi!");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Fayl hajmi 5MB dan katta bo‘lmasligi kerak!");
        return;
      }

      setError(""); // Oldingi xatoliklarni tozalash
      setFileName(file.name);
      setIsLoading(true);

      // Fake yuklash jarayoni (2 soniya)
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
    setFormData((prev) => ({ ...prev, file }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "city" ? { district: "" } : { city: "" }),
    }));
  };

  const validateForms = () => {
    let newErrors = {};
    if (!formData.region.trim())
      newErrors.region = "Viloyatni tanlash majburiy";
    // Agar ikkala maydon ham bo‘sh bo‘lsa, xatolik chiqadi
    if (!formData.city.trim() && !formData.district.trim()) {
      newErrors.city = "Shahar yoki tumanni kiritish majburiy";
      newErrors.district = "Shahar yoki tumanni kiritish majburiy";
    }
    if (!formData.fullName.trim())
      newErrors.fullName = "Ism va familiya majburiy";

    if (!formData.phone.trim()) {
      newErrors.phone = "Telefon raqami majburiy";
    } else if (!/^\+998\d{9}$/.test(formData.phone)) {
      newErrors.phone = "Telefon raqami +998XXXXXXXXX formatida bo‘lishi kerak";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email majburiy";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email noto‘g‘ri formatda";
    }

    if (!formData.message.trim())
      newErrors.message = "Xabar maydoni bo‘sh bo‘lishi mumkin emas";

    // file
    if (formData.file && formData.file.size > 10 * 1024 * 1024) {
      newErrors.file = "Fayl miqdori 10Mb-dan ko‘p bo‘lishi mumkin emas";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Agar xatolik bo'lmasa, true qaytaradi
  };

  const handleSubmit = async () => {
    if (!validateForms()) return; // Agar xatolik bo‘lsa, davom etmaydi

    const data = new FormData();
    data.append("region", formData.region);
    data.append("district", formData.district);
    data.append("city", formData.city);
    data.append("full_name", formData.fullName);
    data.append("phone", formData.phone);
    data.append("email", formData.email);
    data.append("message_text", formData.message);
    data.append("message_receiver", true);
    if (formData.file) {
      data.append("file", formData.file);
    }

    try {
      const response = await axios.post("/message", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // clear the
      setFormData({
        region: "",
        district: "",
        city: "",
        fullName: "",
        phone: "",
        email: "",
        message: "",
        file: null,
      });
      commonAlert("Muvaffaqiyatli yuborildi", "success");
    } catch (error) {
      console.log(error);
      let errorMessage = {
        message: error.response?.data?.message || "Xatolik",
        errors: error.response?.data?.errors || "",
      };
      console.log(errorMessage);
      let errorHTML = `
      <h2>${errorMessage.message}</h2>
      <ul>
       ${JSON.stringify(errorMessage.errors)}
      </ul>
      `;
      commonAlert(errorHTML, "error");
    }
  };

  return (
    <div>
      <div className="cb-or relative pb-4 flex items-center justify-start gap-[30px] pt-[20px]  mb-6 mt-[20px]">
        <h4 className="mt-[-20px] font-semibold text-[14px] leading-[143%] text-[#3538cd]">
          {t("Murojaatyuborish")}
        </h4>
        <div className="absolute left-0 top-150 w-full border-t border-[#f5f5f5] -z-10"></div>
        <div className="absolute left-0 top-150 w-[113px] border-t-2 border-[#3538cd] -z-10"></div>
      </div>
      <div className="cabinet_wr grid grid-cols-3  gap-[50px]">
        <div className="cabinet_card  mr-[30px] ">
          <h4
            className="font-medium text-[14px] leading-[143%] mb-[10px]
                    mr-[-10px] text-[#414651]"
          >
            {t("Viloyat")}
            <span className="text-[#444ce7]">*</span>
          </h4>
          <div
            className={`${errors.region ? "border-red-500" : ""
              } hover:shadow-lg duration-300 flex items-center justify-between  border border-[#f5f5f5] rounded-lg p-[10px_14px] max-w-[410px] w-[100%]shadow-sm shadow-[rgba(10,13,18,0.05)] bg-white `}
          >
            <input
              type="text"
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="active:border-none font-normal text-[16px] leading-[150%] text-[#717680] w-full max-w-[354px] h-[24px]"
              placeholder={`${t("Tanlang")}`}
            />
          </div>
          {/* <p className="text-red-600">{errors.region}</p> */}
        </div>
        <div className="cabinet_card ">
          <h4
            className="font-medium text-[14px] leading-[143%] mb-[10px]
                    mr-[-10px] text-[#414651]"
          >
            {t("Tuman")}
            <span className="text-[#444ce7]">*</span>
          </h4>
          <div
            className={`${errors.district ? "border-red-500" : ""
              } hover:shadow-lg duration-300 flex items-center justify-between  border border-[#f5f5f5] rounded-lg p-[10px_14px] max-w-[410px] w-[100%]shadow-sm shadow-[rgba(10,13,18,0.05)] bg-white `}
          >
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              disabled={district.length > 0} // Agar tuman tanlangan bo‘lsa, disable
              //   className="mt-1 p-2 w-full border rounded-md disabled:bg-gray-400"
              className={`${errors.district ? "border-red-400 border-2" : ""
                } active:border-none font-normal disabled:bg-gray-400 text-[16px] leading-[150%] text-[#717680] border-none w-full max-w-[354px] h-[24px]`}
              placeholder={`${t("Kiriting")}`}
            />

            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              
              <path
                d="M1 1.5L6 6.5L11 1.5"
                stroke="#717680"
                stroke-width="1.66667"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          {/* <p className="text-red-600">{errors.district}</p> */}
        </div>
        <div className="cabinet_card  ">
          <h4
            className="font-medium  text-[14px] leading-[143%] mb-[10px]
                    mr-[-10px] text-[#414651]"
          >
            {t("Shahar")}
            <span className="text-[#444ce7]">*</span>
          </h4>
          <div
            className={`${errors.city ? "border-red-500" : ""
              } hover:shadow-lg duration-300 flex items-center justify-between  border border-[#f5f5f5] rounded-lg p-[10px_14px] max-w-[410px] w-[100%]shadow-sm shadow-[rgba(10,13,18,0.05)] bg-white `}
          >
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={city.length > 0} // Agar shahar tanlangan bo‘lsa, disable
              className={`${errors.city ? "border-red-400 border-2" : ""
                } active:border-none font-normal disabled:bg-gray-400 text-[16px] leading-[150%] text-[#717680] border-none w-full max-w-[354px] h-[24px]`}
              placeholder={`${t("Kiriting")}`}
            />

            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1.5L6 6.5L11 1.5"
                stroke="#717680"
                stroke-width="1.66667"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          {/* <p className="text-red-600">{errors.city}</p> */}
        </div>
        <div className="cabinet_card ">
          <h4
            className="font-medium text-[14px] leading-[143%] mb-[10px]
                    mr-[-10px] text-[#414651]"
          >
            {t("FISh")}
            <span className="text-[#444ce7]">*</span>
          </h4>
          <div
            className={`${errors.fullName ? "border-red-500" : ""
              } hover:shadow-lg duration-300 flex items-center justify-between  border border-[#f5f5f5] rounded-lg p-[10px_14px] max-w-[410px] w-[100%]shadow-sm shadow-[rgba(10,13,18,0.05)] bg-white `}
          >
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`${errors.fullName ? "border-red-400 border-2" : ""
                } active:border-none font-normal text-[16px] leading-[150%] text-[#717680] border-none w-full max-w-[354px] h-[24px]`}
              placeholder={`${t("Kiriting")}`}
            />

            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1.5L6 6.5L11 1.5"
                stroke="#717680"
                stroke-width="1.66667"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          {/* <p className="text-red-600">{errors.fullName}</p> */}
        </div>
        <div className="cabinet_card ">
          <h4
            className="font-medium text-[14px] leading-[143%] mb-[10px]
                    mr-[-10px] text-[#414651]"
          >
            {t("Telefon")}
            <span className="text-[#444ce7]">*</span>
          </h4>
          <div
            className={`${errors.phone ? "border-red-500" : ""
              } hover:shadow-lg duration-300 flex items-center justify-between  border border-[#f5f5f5] rounded-lg p-[10px_14px] max-w-[410px] w-[100%]shadow-sm shadow-[rgba(10,13,18,0.05)] bg-white `}
          >
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`${errors.phone ? "border-red-400 border-2" : ""
                } active:border-none font-normal text-[16px] leading-[150%] text-[#717680] border-none w-full max-w-[354px] h-[24px]`}
              placeholder="+998"
            />

            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1.5L6 6.5L11 1.5"
                stroke="#717680"
                stroke-width="1.66667"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          {/* <p className="text-red-600">{errors.phone}</p> */}
        </div>
        <div className="cabinet_card ">
          <h4
            className="font-medium text-[14px] leading-[143%] mb-[10px]
                    mr-[-10px] text-[#414651]"
          >
            {t("Email")}
            <span className="text-[#444ce7]">*</span>
          </h4>
          <div
            className={`${errors.email ? "border-red-500" : ""
              } hover:shadow-lg duration-300 flex items-center justify-between  border border-[#f5f5f5] rounded-lg p-[10px_14px] max-w-[410px] w-[100%]shadow-sm shadow-[rgba(10,13,18,0.05)] bg-white `}
          >
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${errors.email ? "border-red-400 border-2" : ""
                } active:border-none font-normal text-[16px] leading-[150%] text-[#717680] border-none w-full max-w-[354px] h-[24px]`}
              placeholder="example@gmail.com"
            />

            <svg
              width="12"
              height="8"
              viewBox="0 0 12 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1.5L6 6.5L11 1.5"
                stroke="#717680"
                stroke-width="1.66667"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
          {/* <p className="text-red-600">{errors.email}</p> */}
        </div>
      </div>
      <div className="cabinet_area mt-[40px]">
        <div className="area_wr flex items-center justify-start gap-[10px] ">
          <h4
            className="font-medium text-[14px] leading-[143%] mb-[10px]
                    mr-[-10px] text-[rgb(65,70,81)]"
          >
            {t("Xabar matni")}
            <span className="text-[#444ce7]">*</span>
          </h4>
          <svg
            width="16"
            height="16"
            className="mt-[-10px]"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clip-path="url(#clip0_4059_3273)">
              <path
                d="M6.05967 5.99998C6.21641 5.55442 6.52578 5.17872 6.93298 4.9394C7.34018 4.70009 7.81894 4.61261 8.28446 4.69245C8.74998 4.7723 9.17222 5.01433 9.47639 5.37567C9.78057 5.737 9.94705 6.19433 9.94634 6.66665C9.94634 7.99998 7.94634 8.66665 7.94634 8.66665M7.99967 11.3333H8.00634M14.6663 7.99998C14.6663 11.6819 11.6816 14.6666 7.99967 14.6666C4.31778 14.6666 1.33301 11.6819 1.33301 7.99998C1.33301 4.31808 4.31778 1.33331 7.99967 1.33331C11.6816 1.33331 14.6663 4.31808 14.6663 7.99998Z"
                stroke="#A4A7AE"
                stroke-width="1.33333"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_4059_3273">
                <rect width="16" height="16" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
        <textarea
          className={`w-full max-w-[1280px] h-[154px] border ${errors.message ? "border-red-400" : "border-[#f5f5f5]"
            } rounded-lg p-[12px_14px] shadow-sm shadow-[rgba(10,13,18,0.05)] bg-white`}
          value={formData.message}
          onChange={handleChange}
          placeholder={`${t("Kiriting")}`}
          name="message"
        ></textarea>
        {/* <p className="text-red-600">{errors.message}</p> */}

        <div
          className={`bg-gray-50 cabinet_file border-2 border-black mt-[40px] p-4 rounded-lg cursor-pointer`}
          onClick={handleClick}
        >
          <div>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept=".doc,.pdf,.xls"
              onChange={handleFileChange}
            />
          </div>

          <div className="file_svg">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6.66699 13.3333L10.0003 10M10.0003 10L13.3337 13.3333M10.0003 10V17.5M16.667 13.9524C17.6849 13.1117 18.3337 11.8399 18.3337 10.4167C18.3337 7.88536 16.2816 5.83333 13.7503 5.83333C13.5682 5.83333 13.3979 5.73833 13.3054 5.58145C12.2187 3.73736 10.2124 2.5 7.91699 2.5C4.46521 2.5 1.66699 5.29822 1.66699 8.75C1.66699 10.4718 2.3632 12.0309 3.48945 13.1613"
                stroke="#535862"
                strokeWidth="1.66667"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {isLoading && (
            <div className="flex items-center justify-center mt-2">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-2 border-t-blue-500 rounded-full animate-spin"></div>
              <span className="ml-2 text-blue-500 text-sm">Yuklanmoqda...</span>
            </div>
          )}

          {/* Fayl nomi yoki yuklanayotganini ko‘rsatish */}
          {fileName && (
            <p className="mt-2 text-center text-green-600 text-sm">
              {fileName}
            </p>
          )}

          <h1 className="file_h1 text-center mt-2">
            <span>{t("Kerakli faylni bu yerga")} </span>
            {t("bosish orqali yuklang")} <br />
            <strong>.DOC, .PDF, .XLS</strong> (max. 5 MB)
          </h1>

          {/* Xatolik chiqarish */}
          {error && <p className="text-red-600 mt-2 text-sm">{error}</p>}
        </div>
        <button onClick={handleSubmit} className="file_sent">
          {t("Yuborish")}
        </button>
      </div>
    </div>
  );
}
