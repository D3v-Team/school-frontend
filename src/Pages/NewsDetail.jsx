import { useParams } from "react-router-dom";
import MiniHeader from "../Components/MiniHeader";
import NewsHero from "../Components/News/NewsHero";
import axios from "axios";
import { useEffect, useState } from "react";
import ReactLoading from 'react-loading';
import { useTranslation } from "react-i18next";


export default function NewDetail() {
    const { ID } = useParams()
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const { i18n } = useTranslation();


    const NewsDetail = async () => {
        try {
            const response = await axios.get(`/news-first/${ID}`)
            setData(response?.data?.data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }


    useEffect(() => {
        NewsDetail()
    }, [])

    if (loading) {
        return (
            < div className="flex items-center justify-center w-full h-[400px]" >
                <ReactLoading type="spinningBubbles" color='#fffff' height={100} width={100} />
            </div >
        )
    }

    return (
        <div>
            <MiniHeader title={data?.title[i18n?.language]} minititle={data?.title[i18n?.language]} />
            <NewsHero data={data}/>
        </div>
    )
}