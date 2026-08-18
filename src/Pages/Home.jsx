import Hero from "../Components/Home/Hero";
import InstituteStats from "../Components/Home/InsState";
import Inter from "../Components/Home/Inter";
import UpEvent from "../Components/Home/UpEvent";
import Links from "../Components/Home/Links";
import News from "../Components/Home/News";

export default function Home() {
    return (
        <main className="home">
            <Hero />
            <News />
            <UpEvent />
            <InstituteStats />
            <Inter />
            <Links />
        </main>
    );
}
