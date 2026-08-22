import axios from "axios";
import CabinetHero from "../Components/Cabinet/CabinetHero";
import { useEffect, useState } from "react";
import ReactLoading from 'react-loading';

export default function CabinetPage() {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)

    const getuser = async () => {
        try {
            const response = await axios.get(`/management-message-receiver`)
            setData(response?.data?.data || [])
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getuser()
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
            <CabinetHero data={data} />
        </div>
    )
}