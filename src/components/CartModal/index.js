"use client";

import { Fragment, useContext, useEffect } from "react";
import CommonModal from "../CommonModal";
import { GlobalContext } from "@/context";
import { deleteFromCart, getAllCartItems } from "@/services/cart";
import { toast } from "react-toastify";
import ComponentLevelLoader from "../Loader/componentlevel";
import { useRouter } from "next/navigation";

export default function CartModal() {
  const {
    showCartModal,
    setShowCartModal,
    cartItems,
    setCartItems,
    user,
    setComponentLevelLoader,
    componentLevelLoader,
  } = useContext(GlobalContext);

  const router = useRouter();

  async function extractAllCartItems() {
    const res = await getAllCartItems(user?._id);

    if (res.success) {
      const updatedData =
        res.data && res.data.length
          ? res.data.map((item) => ({
              ...item,
              productID: {
                ...(item.productID || {}),
                price:
                item.productID && item.productID.onSale === "yes"
                    ? parseInt(
                        (
                          (item.productID.price || 0) -
                          (item.productID.price || 0) * (item.productID.priceDrop / 100)
                        ).toFixed(2)
                      )
                    : (item.productID && item.productID.price) || 0,
              },
            }))
          : [];
      setCartItems(updatedData);
      localStorage.setItem("cartItems", JSON.stringify(updatedData));
    }

    console.log(res);
  }

  useEffect(() => {
    if (user !== null) extractAllCartItems();
  }, [user]);

  async function handleDeleteCartItem(getCartItemID) {
    setComponentLevelLoader({ loading: true, id: getCartItemID });
    const res = await deleteFromCart(getCartItemID);

    if (res.success) {
      setComponentLevelLoader({ loading: false, id: "" });
      toast.success(res.message, {
        position: toast.POSITION.TOP_RIGHT,
      });

      extractAllCartItems();
    } else {
      toast.error(res.message, {
        position: toast.POSITION.TOP_RIGHT,
      });
      setComponentLevelLoader({ loading: false, id: getCartItemID });
    }
  }

  return (
    <CommonModal
      showButtons={true}
      show={showCartModal}
      setShow={setShowCartModal}
      mainContent={
        cartItems && cartItems.length ? (
          <ul role="list" className="my-4 md:-my-6 divide-y divide-gray-300 ml-0 md:ml-2">
            {cartItems.map((cartItem) => (
              <li key={cartItem._id} className="flex pt-10 md:pt-4">
                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  <img
                    src={
                      cartItem &&
                      cartItem.productID &&
                      cartItem.productID.imageUrl
                    }
                    alt="Cart Item"
                    className="h-full w-full object-cover object-center"
                  />
                </div>
                <div className="ml-3 md:ml-4 max-w-screen-sm flex flex-1 flex-col">
                  <div className="mr-4 md:mr-0">
                    <div className="flex justify-between text-base font-medium text-gray-900">
                      <h3>
                        <a>
                          {cartItem &&
                            cartItem.productID &&
                            cartItem.productID.name}
                        </a>
                      </h3>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      
                      {cartItem &&
                        cartItem.productID &&
                        cartItem.productID.price} VNĐ
                      
                    </p>
                  </div>
                  <div className="flex flex-1 items-end justify-between text-sm mr-4 md:mr-0">
                    <button
                      type="button"
                      className="font-medium text-yellow-600 sm:order-2"
                      onClick={() => handleDeleteCartItem(cartItem._id)}
                    >
                      {componentLevelLoader &&
                      componentLevelLoader.loading &&
                      componentLevelLoader.id === cartItem._id ? (
                        <ComponentLevelLoader
                          text={"Removing"}
                          color={"#000000"}
                          loading={
                            componentLevelLoader && componentLevelLoader.loading
                          }
                        />
                      ) : (
                        "Remove"
                      )}
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : null
      }
      buttonComponent={
        <Fragment>
          <button
            type="button"
            onClick={() => {
              router.push("/cart");
              setShowCartModal(false);
            }}
            className="ml-0  md:ml-2 mt-1.5 w-full inline-block bg-black text-white px-5 py-3 text-xs font-medium uppercase tracking-wide rounded-md"
          >
            Go To Cart
          </button>
          <button
            disabled={cartItems && cartItems.length === 0}
            type="button"
            onClick={() => {
              router.push("/checkout");
              setShowCartModal(false);
            }}
            className="ml-0 md:ml-2  mt-1.5 w-full inline-block bg-black text-white px-2 py-3 text-xs font-medium uppercase tracking-wide disabled:opacity-50 rounded-md"
          >
            Checkout
          </button>
          <div className=" ml-0  md:ml-2 mt-6 flex justify-center text-center text-sm text-gray-600">
            <button type="button" className="font-medium text-grey rounded-md" onClick={() => {router.push("/product/listing/all-products"); setShowCartModal(false);}}>
              Continue Shopping
              <span aria-hidden="true"> &rarr;</span>
            </button>
          </div>
        </Fragment>
      }
    />
  );
}
