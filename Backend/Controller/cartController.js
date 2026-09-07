import Cart from "../model/cart.js";

export const addToCart = async (req, res) => {
    try{
        const { userId, productId } = req.body;
        if (!userId || !productId) {
            return res.status(400).json({ message: "userId and productId are required" });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [
                { productId, quantity: 1 },
            ] });
        } else{
            if (!Array.isArray(cart.items)) {
                cart.items = [];
            }

            const item = cart.items.find(
                i => i.productId.toString() === productId.toString());

            if(item){
                item.quantity += 1;

            }else{
                cart.items.push({ productId, quantity: 1 });

            }

        }

        await cart.save();
        return res.status(200).json({ message: "Product added to cart", cart });


    }catch(error){
        return res.status(500).json({ message: "Unable to add to cart", error: error.message });
}
};

//remove item from cart

export const removeFromCart = async (req, res) => {
    try{
        const { userId, productId } = req.body;

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }  
        cart.items = cart.items.filter(i => i.productId.toString() !== productId.toString());

        await cart.save();
        return res.json({ message: "Product removed from cart", cart });

    }catch(error){
        return res.status(500).json({ message: "server error", error: error.message });
    }
};


//update cart item quantity

export const updateQuantity = async (req, res) => {
    try{
        const { userId, productId, quantity } = req.body;
        if (quantity == null || quantity < 1) {
            return res.status(400).json({ message: "quantity must be at least 1" });
        }

        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        if (!Array.isArray(cart.items)) {
            cart.items = [];
        }

        const normalizedProductId = productId.toString();
        const item = cart.items.find(i => i.productId.toString() === normalizedProductId);

        if (!item) {
            cart.items.push({ productId, quantity: Number(quantity) });
            await cart.save();
            return res.json({ message: "Product added to cart with updated quantity", cart });
        }

        item.quantity = Number(quantity);

        await cart.save();
        return res.json({ message: "Cart updated", cart });


    }
    catch(error){
        return res.status(500).json({ message: "server error", error: error.message });
    }
};

//get cart items
export const getCart = async (req, res) => {
    try{
        const { userId } = req.params;

        const cart = await Cart.findOne({ userId }).populate("items.productId");
        if (!cart) {
            return res.status(404).json({ message: "Cart not found" });
        }
        return res.json({ cart });
    }catch(error){
        return res.status(500).json({ message: "server error", error: error.message });
    }
};



