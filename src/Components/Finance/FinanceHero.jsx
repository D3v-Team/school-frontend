import pdp from '../../img/pdp.png'
export default  function FinanceHero(){
    const handleDownload = () => {
        const pdfUrl = "/docs/finance_report.pdf"; // PDF fayl joylashgan yo‘l
        const link = document.createElement("a");
        link.href = pdfUrl;
        link.setAttribute("download", "finance_report.pdf"); // Fayl nomi
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return(
        <section className="finance mb-[30px] mt-[30px]">
            <div className="Container">
                <div className="finance_b">
             <p>2023 yilda I chorakda Raqamli texnologiyalar vazirligining byudjetdan ajratilgan mablag‘larning chegaralangan miqdorini o‘z tasarrufidagi byudjet tashkilotlari kesimida taqsimoti to‘g‘risida ma’lumot.</p>
                </div>
                <div className="finance_w">
             <p>2023-yil I-chorak bo‘yicha TATU va uning hududiy filiallari budjet mablag‘lari hisoboti</p>
             <button onClick={handleDownload} className='pdp'>
                <img src={pdp} alt="" />
                <span>Yuklab olish</span>
             </button>
                </div>
                <div className="finance_b">
             <p>2023 yilda I chorakda Raqamli texnologiyalar vazirligining byudjetdan ajratilgan mablag‘larning chegaralangan miqdorini o‘z tasarrufidagi byudjet tashkilotlari kesimida taqsimoti to‘g‘risida ma’lumot.</p>
                </div>
                <div className="finance_w">
             <p>2023-yil I-chorak bo‘yicha TATU va uning hududiy filiallari budjet mablag‘lari hisoboti</p>
             <button onClick={handleDownload} className='pdp'>
                <img src={pdp} alt="" />
                <span>Yuklab olish</span>
             </button>
                </div>
                <div className="finance_b">
             <p>2023 yilda I chorakda Raqamli texnologiyalar vazirligining byudjetdan ajratilgan mablag‘larning chegaralangan miqdorini o‘z tasarrufidagi byudjet tashkilotlari kesimida taqsimoti to‘g‘risida ma’lumot.</p>
                </div>
            </div>
        </section>
    )
}