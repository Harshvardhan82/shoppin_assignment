"use client";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { Badge, Typography } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { Product } from "../../types";
import { addToCart, addToLiked } from "../LocalProvider/productSlice";
import { RootState } from "../LocalProvider/store";
import { products } from "../Mocks/products";
import TinderCard from "./card";

function Swiper() {
  const dispatch = useDispatch();

  const cartProducts = useSelector(
    (state: RootState) => state.products.cartProducts
  );
  const likedProducts = useSelector(
    (state: RootState) => state.products.likedProducts
  );

  const outOfFrame = (direction: string, product: Product) => {
    if (direction === "right") {
      dispatch(addToLiked(product));
    } else if (direction === "up") {
      dispatch(addToCart(product));
    } else {
    }
  };

  return (
    <div className="relative w-[95vw] max-w-lg h-[95vh]">
      <div id="like-icon" className="fixed top-5 left-5 z-50">
        <Badge badgeContent={likedProducts.length} color="secondary">
          <FavoriteBorderOutlinedIcon fontSize="large" className="text-black" />
        </Badge>
      </div>
      <div id="cart-icon" className="fixed top-5 right-5 z-50">
        <Badge badgeContent={cartProducts.length} color="primary">
          <ShoppingCartOutlinedIcon fontSize="large" className="text-black" />
        </Badge>
      </div>
      {products.map((product: Product) => (
        <TinderCard
          className="absolute flex items-center justify-center"
          key={product.name}
          onCardLeftScreen={(dir) => outOfFrame(dir, product)}
          preventSwipe={["down"]}
        >
          <div
            className="text-black bg-[#eaffff] w-[95vw] max-w-[500px] h-[95vh] shadow-[0_0_60px_0_rgba(0,0,0,0.3)] rounded-[20px] bg-cover bg-center flex flex-col"
            style={{ backgroundImage: "url(" + product.imageUrl + ")" }}
          >
            <div className="absolute bottom-0 w-full bg-[rgba(157,251,251,0.5)] rounded-[20px]">
              <Typography className="px-2 italic text-wrap" fontSize={20}>
                {product.name}
              </Typography>
              <Typography className="px-2" fontSize={15}>
                {product.brand}
              </Typography>
              <div className="px-2 flex flex-row w-full">
                <Typography
                  className="px-[5px] italic line-through"
                  fontSize={15}
                >
                  M.R.P. ₹{product.originalPrice}
                </Typography>
                <Typography className="" fontSize={15}>
                  (-{product.discountPercentage}%) ₹{product.price}
                </Typography>
              </div>
            </div>
          </div>
        </TinderCard>
      ))}
      <div></div>
    </div>
  );
}

export default Swiper;
