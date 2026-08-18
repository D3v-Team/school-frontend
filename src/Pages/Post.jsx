import { useParams } from "react-router-dom";
import MiniHeader from "../Components/MiniHeader";
import PostHero from "../Components/userPost/PostHero";
import axios from "axios";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactLoading from 'react-loading';


export default function UserPost() {
    const { ID } = useParams()
    const [data, setData] = useState([])
    const [title, setTitle] = useState([])
    const { i18n } = useTranslation();
    const [loading, setLoading] = useState(true)

    const getPost = async () => {
        try {
            const response = await axios.get(`/categoriy-detail-first/${ID}`)
            setData(response?.data?.data?.posts)
            setTitle(response?.data?.data)
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getPost()
    }, [ID])


    if (loading) {
        return (
            < div className="flex items-center justify-center w-full h-[400px]" >
                <ReactLoading type="spinningBubbles" color='#fffff' height={100} width={100} />
            </div >
        )
    }

    return (
        <div className="">
            <MiniHeader title={data[0]?.title[i18n?.language]} minititle={data[0]?.title[i18n?.language]} />
            <PostHero data={data} />
        </div>
    )
}