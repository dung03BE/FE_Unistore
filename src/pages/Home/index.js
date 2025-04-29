
import { useNavigate } from "react-router-dom";
import Product from "../../components/product";

function Home() {
    const navigate = useNavigate();
    return (
        <>
            <Product navigate={navigate} />
        </>
    )
}
export default Home;