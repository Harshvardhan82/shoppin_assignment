import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "../../types";

interface ProductState {
    likedProducts: Product[];
    cartProducts: Product[];
}

const initialState: ProductState = {
    likedProducts: [],
    cartProducts: [],
};

export const productSlice = createSlice({
    name: "products",
    initialState,
    reducers: {
        addToLiked: (state, action: PayloadAction<Product>) => {
            if (!state.likedProducts.find((p) => p.id === action.payload.id)) {
                state.likedProducts.push(action.payload);
            }
        },
        removeFromLiked: (state, action: PayloadAction<string>) => {
            state.likedProducts = state.likedProducts.filter(
                (product) => product.id !== action.payload
            );
        },
        addToCart: (state, action: PayloadAction<Product>) => {
            if (!state.cartProducts.find((p) => p.id === action.payload.id)) {
                state.cartProducts.push(action.payload);
            }
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.cartProducts = state.cartProducts.filter(
                (product) => product.id !== action.payload
            );
        },
        clearCart: (state) => {
            state.cartProducts = [];
        },
    },
});

export const {
    addToLiked,
    removeFromLiked,
    addToCart,
    removeFromCart,
    clearCart,
} = productSlice.actions;

export default productSlice.reducer;