import { Carousel } from "antd";
import "./productCarousel.scss"

function ProductCarousel({ images }) {
    return (
        <div className="product-carousel">
            <Carousel autoplay>
                {images.map((image, index) => (
                    <div key={index}>
                        <img src={image} alt={`Ad ${index + 1}`} className="carousel-image" />
                    </div>
                ))}
            </Carousel>
        </div>
    );
}

export default ProductCarousel;