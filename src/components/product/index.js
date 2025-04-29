import { useEffect, useState } from "react";
import { getAdList, getProductList, getProductListByCategoryId } from "../../services/productService";
import React from 'react';
import { Pagination } from 'antd';
import "./product.scss";
import ProductItem from "./ProductItem";
import ProductCarousel from "./ProductCarousel";
import { useSearchParams, useNavigate } from 'react-router-dom';

function Product() {
    const [product, setProduct] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [adImages, setAdImages] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 8;
    const [loading, setLoading] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const search = searchParams.get('search') || '';
    const [minPriceFilter, setMinPriceFilter] = useState('');
    const [maxPriceFilter, setMaxPriceFilter] = useState('');
    const minPriceParam = searchParams.get('minPrice');
    const maxPriceParam = searchParams.get('maxPrice');
    const categoryIdParam = searchParams.get('categoryId');

    const minPrice = minPriceParam ? parseFloat(minPriceParam) : undefined;
    const maxPrice = maxPriceParam ? parseFloat(maxPriceParam) : undefined;
    const categoryId = categoryIdParam ? parseInt(categoryIdParam) : undefined;
    const [selectedCategory, setSelectedCategory] = useState(categoryId);
    useEffect(() => {
        const fetchAds = async () => {
            const ads = await getAdList();
            setAdImages(ads);
        };
        fetchAds();
    }, []);

    useEffect(() => {
        const fetchApi = async () => {
            setLoading(true);
            let result;

            if (categoryId) {
                // Nếu có categoryId, gọi API lọc theo category
                result = await getProductListByCategoryId(currentPage - 1, pageSize, categoryId);
            } else {
                // Nếu không có categoryId, gọi API lọc theo các tham số khác
                result = await getProductList(currentPage - 1, pageSize, minPrice, maxPrice, search);
            }

            setProduct(result.content);
            setTotalItems(result.totalElements);
            setLoading(false);
        };
        fetchApi();
    }, [currentPage, search, minPrice, maxPrice, categoryId]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const handlePriceFilterChange = (e) => {
        if (e.key === 'Enter') {
            const newParams = new URLSearchParams(searchParams);
            if (minPriceFilter) {
                newParams.set('minPrice', minPriceFilter);
            } else {
                newParams.delete('minPrice');
            }
            if (maxPriceFilter) {
                newParams.set('maxPrice', maxPriceFilter);
            } else {
                newParams.delete('maxPrice');
            }
            navigate(`/?${newParams.toString()}`);
        }
    };

    const handleCategoryFilter = (categoryId) => {
        const newParams = new URLSearchParams(searchParams);
        newParams.set('categoryId', categoryId);
        setCurrentPage(1); // Reset page to 1
        navigate(`/?${newParams.toString()}`);
        setSelectedCategory(categoryId);
    };

    return (
        <>
            <ProductCarousel images={adImages} />
            <div className="filter-group">
                <button className="filter-button">
                    <i className="icon-filter"></i>
                    Lọc
                </button>
                <button className={`filter-option ${selectedCategory === 1 ? 'selected' : ''}`} onClick={() => handleCategoryFilter(1)}>
                    <i className="icon-filter2"></i>
                    Samsung
                </button>
                <button className={`filter-option ${selectedCategory === 2 ? 'selected' : ''}`} onClick={() => handleCategoryFilter(2)}>
                    <i className="icon-filter3"></i>
                    Apple
                </button>
                <button className={`filter-option ${selectedCategory === 3 ? 'selected' : ''}`} onClick={() => handleCategoryFilter(3)}>
                    <i className="icon-filter4"></i>
                    Oppo
                </button>
                <div className="searchPrice">
                    <input
                        type="number"
                        placeholder="Giá min"
                        value={minPriceFilter}
                        onChange={(e) => setMinPriceFilter(e.target.value)}
                        onKeyDown={handlePriceFilterChange}
                    />
                    <input
                        type="number"
                        placeholder="Giá max"
                        value={maxPriceFilter}
                        onChange={(e) => setMaxPriceFilter(e.target.value)}
                        onKeyDown={handlePriceFilterChange}
                    />
                </div>
            </div>
            {loading ? (
                <p>Đang tải...</p>
            ) : (
                <div className="product">
                    {product.length > 0 ? (
                        product.map(item => (
                            <ProductItem item={item} key={item.id} />
                        ))
                    ) : (
                        <p>Không có sản phẩm nào</p>
                    )}
                </div>
            )}
            <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalItems}
                onChange={handlePageChange}
            />
        </>
    );
}

export default Product;