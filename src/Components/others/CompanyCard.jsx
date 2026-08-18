

export default function CompanyCard({img,h4,p}){
    return (
        <div className="company_card cursor-pointer mx-auto">
            <img src={img} alt="" />
            <h4>{h4}</h4>
            <p>{p}</p>
        </div>
    )
}