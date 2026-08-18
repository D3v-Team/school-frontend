import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import ReactLoading from "react-loading";


export default function WorkHero() {
  const { i18n } = useTranslation();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const getInfo = async () => {
    try {
      const response = await axios.get(`/job-vacancie`);
      setData(response?.data?.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getInfo();
  }, []);


  if (loading) {
    return (
      < div className="flex items-center justify-center w-full h-[400px]" >
        <ReactLoading type="spinningBubbles" color='#fffff' height={100} width={100} />
      </div >
    )
  }

  return (
    <section>
      <div className="Container">
        <div className=" flex items-center justify-center mt-[20px] mb-[30px] flex-col gap-[24px] w-full">
          {data?.length > 0 ? (
            data?.map((i, index) => (
              < div
                key={index}
                className="work_big w-full border-[1px] px-[24px] py-[18px] bg-white cursor-pointer duration-500 hover:shadow-lg rounded-[8px] flex items-center gap-[10px] justify-between">
                <div className="work_card">
                  <div className="flex items-center justify-start gap-[20px] mb-[20px]">
                    <span className="text-[#181d27] text-[18px] ">
                      {i?.title[i18n?.language]}
                    </span>
                    <div className="aniq_div">
                      <span className="aniq"> •  {i?.faculty[i18n?.language]}</span>
                    </div>
                  </div>
                  <h4 className="mb-[10px]">
                    {i?.description[i18n?.language]}
                  </h4>
                  <div className="card_wr flex items-center justify-start gap-[20px]">
                    <div className="flex items-center justify-start gap-[5px]" >
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.0007 10.4167C11.3814 10.4167 12.5007 9.2974 12.5007 7.91669C12.5007 6.53598 11.3814 5.41669 10.0007 5.41669C8.61994 5.41669 7.50065 6.53598 7.50065 7.91669C7.50065 9.2974 8.61994 10.4167 10.0007 10.4167Z" stroke="#A4A7AE" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M10.0007 18.3334C11.6673 15 16.6673 12.8486 16.6673 8.33335C16.6673 4.65146 13.6825 1.66669 10.0007 1.66669C6.31875 1.66669 3.33398 4.65146 3.33398 8.33335C3.33398 12.8486 8.33398 15 10.0007 18.3334Z" stroke="#A4A7AE" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                      </svg>
                      <h4>
                        {i?.location[i18n?.language]}
                      </h4>
                    </div>
                    <div className="
                        flex items-center justify-start gap-[5px]">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clip-path="url(#clip0_4075_4788)">
                          <path d="M9.99935 5.00002V10L13.3327 11.6667M18.3327 10C18.3327 14.6024 14.6017 18.3334 9.99935 18.3334C5.39698 18.3334 1.66602 14.6024 1.66602 10C1.66602 5.39765 5.39698 1.66669 9.99935 1.66669C14.6017 1.66669 18.3327 5.39765 18.3327 10Z" stroke="#A4A7AE" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                        </g>
                        <defs>
                          <clipPath id="clip0_4075_4788">
                            <rect width="20" height="20" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                      <h4>
                        {i?.employment_type[i18n?.language]}
                      </h4>
                    </div>
                  </div>
                </div>
                <div className="text-[#A4A7AE] text-[30px] flex items-center justify-start gap-[10px]">
                  <a href={i?.url} target="_blank" rel="noopener noreferrer">
                    <span className="text-[#3538cd] text-[13px]">Batafsil</span>
                  </a>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.833984 9.16665L9.16732 0.833313M9.16732 0.833313H0.833984M9.16732 0.833313V9.16665" stroke="#3538CD" stroke-width="1.66667" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </div>
              </div>
            ))
          ) : (
            < div className="flex items-center justify-center w-full h-[400px]" >
              <h1 className="text-[25px] opacity-[0.7]">
                Malumot yo'q
              </h1>
            </div>
          )}
        </div>
      </div>
    </section >
  )
}