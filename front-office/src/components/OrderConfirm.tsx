import React, { useState, useEffect } from "react";
import axios from "axios";
import { useForm, Controller } from "react-hook-form";
import MySelect from "./MySelect";
import { prefecturesOptions } from "../utils/prefectures";
import Visa from "../assets/Visa.svg";
import MasterCard from "../assets/MasterCard.svg";
import Paypal from "../assets/PayPal.svg";
import AmericanExpress from "../assets/AmericanExpress.svg";
import CashTrade from "../assets/CashTrade.svg";
import { zodResolver } from "@hookform/resolvers/zod";
import { validationSchema } from "../utils/validationSchema";
import { orderSchema } from "../utils/orderSchema";
import { useNavigate } from "react-router-dom";
import { HOST_IP } from "../config";
import { times } from "../utils/times";
import { getAccessToken, decodeToken, isLoggedIn } from "../utils/authUtils";
import LoginModal from "../components/LoginModal";
import { CartTop } from "../pages/Cart";
import CartItem from '../components/CartItem';



interface OrderConfirmForm {
  orderId: number;
  userId: number;
  destinationName: string;
  destinationEmail: string;
  postcode: string;
  prefecture: string;
  municipalities: string;
  address: string;
  telephone: string;
  deliveryDate: string;
  deliveryTime: string;
  paymentMethod: string;
}

const OrderConfirm: React.FC = () => {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<OrderConfirmForm>({
    mode: "onBlur",
    resolver: zodResolver(orderSchema),
  });


  const [loading, setLoading] = useState(false);

  const [order, setOrder] = useState<any[]>([]);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [buttonColor, setButtonColor] = useState('bg-gray-800');
  const [isCartVisible, setIsCartVisible] = useState(false);
  const [triangleDirection, setTriangleDirection] = useState<'down' | 'up'>('down');

  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + 2); // 今日の日付に2日を加える
    const formattedDate = today.toISOString().substr(0, 10);
    setValue("deliveryDate", formattedDate); // フォームの値をセット
  }, []);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          setShowModal(true);
          return;
        }

        const userInfo = decodeToken(token);
        if (!userInfo) {
          setShowModal(true);
          return;
        }
        const response = await axios.get(
          `http://${HOST_IP}:8080/ec-202404c/cart/user/${userInfo.userid}`
        );
        setOrder(response.data);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      }
    };

    fetchOrder();
  }, []);

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setButtonColor('bg-gray-500')
        const token = getAccessToken();
        if (!token) {
          setShowModal(true);
          return;
        }

        const userInfo = decodeToken(token);
        if (!userInfo) {
          setShowModal(true);
          return;
        }
        const response = await axios.get(`http://${HOST_IP}:8080/ec-202404c/cart/user/${userInfo.userid}`);
        setCartItems(response.data.itemList);
        console.log(response.data);  // デバッグ用に追加
      } catch (error) {
        console.error('Error fetching cart items:', error);
      }
    };

    fetchCartItems();
  }, []);

  const handleDelete = async (orderItemId: number) => {
    try {
      const token = getAccessToken();
      const userInfo = decodeToken(token);
      await axios.delete(`http://${HOST_IP}:8080/ec-202404c/cart/delete`, {
        data: {
          orderItemId: orderItemId,
          userId: userInfo?.userid
        }
      });
      setCartItems(prevItems => prevItems.filter(item => item.id !== orderItemId));
    } catch (error) {
      console.error('Error deleting cart item:', error);
    }
  };

  const onSubmit = async (data: OrderConfirmForm) => {
    setIsSubmitting(true);
    // `deliveryDate` を Date オブジェクトとして作成
    const deliveryDate = new Date(data.deliveryDate);

    // デリバリー時間をセット
    const deliveryHour = Number.parseInt(data.deliveryDate);

    if (!isNaN(deliveryHour)) {
      deliveryDate.setHours(deliveryHour);
    }

    const token = getAccessToken();
    if (!token) {
      setShowModal(true);
      return;
    }

    const userInfo = decodeToken(token);
    if (!userInfo) {
      setShowModal(true);
      return;
    }

    // 結合したフィールドを含むオブジェクトを作成
    const formData = {
      orderId: order.id,
      userId: userInfo.userid,
      destinationName: data.destinationName,
      destinationEmail: data.destinationEmail,
      zipcode: data.postcode,
      prefecture: data.prefecture,
      municipalities: data.municipalities,
      address: data.address,
      telephone: data.telephone,
      deliveryDate: deliveryDate,
      deliveryTime: deliveryHour,
      paymentMethodId: data.paymentMethod,
    };

    console.log(formData);
    const response = await axios.post(
      `http://${HOST_IP}:8080/ec-202404c/order`,
      formData
    );
    // 成功
    if (response.status === 200) {
      if (formData.paymentMethodId === "1") {
        navigate('/complete');
      } else {
        navigate("/credit-card-info");
      }

    } else {
      <p>エラーが発生しました！</p>;
    }


  };

  const handleBackClick = () => {
    navigate("/item-list/");
  };

  const fetchAddress = async (postcode: number) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${postcode}`
      );
      const data = response.data;

      if (data.results) {
        const result = data.results[0];
        setValue("prefecture", result.address1);
        setValue("municipalities", result.address2);
        setValue("address", result.address3);
      } else {
        alert("住所が見つかりませんでした。");
      }
    } catch (error) {
      console.error("住所の取得に失敗しました:", error);
      alert("住所の取得に失敗しました。");
    }
    setLoading(false);
  };

  // クリック時に表示・非表示を切り替える関数
  const toggleCartVisibility = () => {
    setIsCartVisible(!isCartVisible);
    setTriangleDirection(triangleDirection === 'down' ? 'up' : 'down');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100" style={{ paddingTop:'50px',transform:' translateY(-28px)'}}>

      <div className="container mx-auto flex justify-center flex-col">
        <div
          className="flex items-center justify-center cursor-pointer bg-blue-gray-500 text-white p-2 rounded hover:underline mx-40 hover:bg-blue-gray-600"
          onClick={toggleCartVisibility}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 mr-1 transition-transform transform ${isCartVisible ? 'rotate-180' : 'rotate-0'}`}
            viewBox="0 0 11 10"
            fill="currentColor"
            onClick={toggleCartVisibility}
          >
            <path
              d="M0 0H10.9091L5.45455 9.27272L0 0ZM1.64063 0.937503L5.45455 7.42329L9.26847 0.937503H1.64063Z"
              fill="currentColor"
            />
          </svg>
          <span className="text-center">
            カート表示する
          </span>
        </div>
        {isCartVisible && <CartTop cartItems={cartItems} handleDelete={handleDelete} />}
      </div>

      <div className="w-full sm:w-4/5 lg:w-3/5 mt-20 mb-20">
        <div className="mx-2 my-20 sm:my-auto">
          <div className="flex justify-center">
            <div className="w-full sm:w-11/12 p-12 sm:px-10 sm:py-6 bg-white rounded-lg shadow-md lg:shadow-lg">
              <h2 className="text-center  font-semibold text-3xl lg:text-4xl text-gray-800 mt-6 mb-6">
                ご注文情報の入力
              </h2>
              <form className="mt-10" onSubmit={handleSubmit(onSubmit)}>
                <label htmlFor="orderName" className="block text-xs font-semibold text-gray-600 uppercase">
                  お名前
                </label>
                <input
                  type="text"
                  id="orderName"
                  {...register("destinationName")}
                  className="block w-full py-3 px-1 mt-2 text-gray-800 appearance-none border-b-2 border-gray-100 focus:text-gray-500 focus:outline-none focus:border-gray-200"
                />
                <p className="text-red-500 text-xs mt-1">
                  {errors.destinationName && errors.destinationName.message}
                </p>

                <br />

                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-gray-600 uppercase"
                >
                  メールアドレス
                </label>
                <input
                  type="email"
                  id="email"
                  {...register("destinationEmail")}
                  className="block w-full py-3 px-1 mt-2 text-gray-800 appearance-none border-b-2 border-gray-100 focus:text-gray-500 focus:outline-none focus:border-gray-200"
                />
                <p className="text-red-500 text-xs mt-1">
                  {errors.destinationEmail && errors.destinationEmail.message}
                </p>
                <br />

                <label
                  htmlFor="postcode"
                  className="block text-xs font-semibold text-gray-600 uppercase"
                >
                  郵便番号（ハイフン“−”は不要です）
                </label>
                <div className="flex items-center">
                  <input
                    type="number"
                    id="postcode"
                    {...register("postcode")}
                    className="block w-full py-3 px-1 mt-2 text-gray-800 appearance-none border-b-2 border-gray-100 focus:text-gray-500 focus:outline-none focus:border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={async () => {

                      await fetchAddress(Number(watch("postcode")))
                      trigger("prefecture");
                      trigger("municipalities");
                      trigger("address");
                    }
                    }

                    disabled={loading}
                    className="ml-4 w-48 bg-gray-800 py-3 px-6 rounded-sm text-white uppercase font-medium focus:outline-none hover:bg-gray-700 hover:shadow-none"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <span className="loading loading-ring loading-md"></span>
                        取得中...
                      </div>
                    ) : (
                      "住所取得"
                    )}
                  </button>
                </div>
                <p className="text-red-500 text-xs mt-1">
                  {errors.postcode && errors.postcode.message}
                </p>
                <br />

                <label
                  htmlFor="prefectures"
                  className="block text-xs font-semibold text-gray-600 uppercase"
                >
                  都道府県
                </label>
                <Controller
                  name="prefecture"
                  control={control}
                  render={({ field }) => (
                    <MySelect
                      value={field.value}
                      onChange={field.onChange}
                      options={prefecturesOptions}
                    />
                  )}
                />
                <p className="text-red-500 text-xs mt-1">
                  {errors.prefecture && errors.prefecture.message}
                </p>
                <br />

                <label
                  htmlFor="municipalities"
                  className="block text-xs font-semibold text-gray-600 uppercase"
                >
                  市区町村
                </label>
                <input
                  type="text"
                  id="municipalities"
                  {...register("municipalities")}
                  className="block w-full py-3 px-1 mt-2 text-gray-800 appearance-none border-b-2 border-gray-100 focus:text-gray-500 focus:outline-none focus:border-gray-200"
                />
                <p className="text-red-500 text-xs mt-1">
                  {errors.municipalities && errors.municipalities.message}
                </p>
                <br />

                <label
                  htmlFor="address"
                  className="block text-xs font-semibold text-gray-600 uppercase"
                >
                  住所
                </label>
                <input
                  type="text"
                  id="address"
                  {...register("address")}
                  className="block w-full py-3 px-1 mt-2 text-gray-800 appearance-none border-b-2 border-gray-100 focus:text-gray-500 focus:outline-none focus:border-gray-200"
                />
                <p className="text-red-500 text-xs mt-1">
                  {errors.address && errors.address.message}
                </p>
                <br />

                <label
                  htmlFor="tel"
                  className="block text-xs font-semibold text-gray-600 uppercase"
                >
                  電話番号（ハイフン“−”は不要です）
                </label>
                <input
                  type="tel"
                  id="tel"
                  inputMode="numeric"
                  {...register("telephone")}
                  maxLength={11}
                  className="block w-full py-3 px-1 mt-2 text-gray-800 appearance-none border-b-2 border-gray-100 focus:text-gray-500 focus:outline-none focus:border-gray-200"
                />
                <p className="text-red-500 text-xs mt-1">
                  {errors.telephone && errors.telephone.message}
                </p>
                <br />

                <label
                  htmlFor="deliveryDate"
                  className="block text-xs font-semibold text-gray-600 uppercase"
                >
                  配達日時
                </label>
                <input
                  type="date"
                  id="deliveryDate"
                  {...register("deliveryDate")}
                  min={new Date(new Date().setDate(new Date().getDate() + 2)).toISOString().split("T")[0]}
                  className="block w-full py-3 px-1 mt-2 text-gray-800 appearance-none border-b-2 border-gray-100 focus:text-gray-500 focus:outline-none focus:border-gray-200"
                />
                <br />
                <br />

                <Controller
                  name="deliveryTime"
                  control={control}
                  render={({ field }) => (
                    <MySelect
                      value={field.value}
                      onChange={field.onChange}
                      options={times}
                    />
                  )}
                />
                <p className="text-red-500 text-xs mt-1">
                  {errors.deliveryDate && errors.deliveryDate.message}
                </p>
                <p className="text-red-500 text-xs mt-1">
                  {errors.deliveryTime && errors.deliveryTime.message}
                </p>
                <br />

                <label className="block text-xs font-semibold text-gray-600 uppercase">
                  お支払方法
                </label>
                <div>
                  <Controller
                    name="paymentMethod"
                    control={control}
                    defaultValue=""
                    render={({ field }) => (
                      <>
                        <div className="w-72">
                          <div className="mb-3">
                            <input
                              type="radio"
                              {...field}

                              className="sr-only peer"
                              value="2"
                              id="answer_american-express-card"
                            />
                            <label
                              className="flex p-5 bg-white border rounded-lg cursor-pointer focus:outline-none hover:bg-gray-50 peer-checked:ring-gray-700 peer-checked:ring-2 peer-checked:border-transparent"
                              htmlFor="answer_american-express-card"
                            >
                              <div className="flex items-center">
                                <img
                                  src={AmericanExpress}
                                  alt="MasterCard"
                                  className="w-12 h-6 mr-2"
                                />
                                <div className="text-sm">AmericanExpress </div>
                              </div>
                            </label>
                          </div>
                          <div className="mb-3">
                            <input
                              type="radio"
                              {...field}

                              className="sr-only peer"
                              value="2"
                              id="answer_master-card"
                            />
                            <label
                              className="flex p-5 bg-white border rounded-lg cursor-pointer focus:outline-none hover:bg-gray-50 peer-checked:ring-gray-700 peer-checked:ring-2 peer-checked:border-transparent"
                              htmlFor="answer_master-card"
                            >
                              <div className="flex items-center">
                                <img
                                  src={MasterCard}
                                  alt="MasterCard"
                                  className="w-12 h-6 mr-2"
                                />
                                <div className="text-sm">MasterCard</div>
                              </div>
                            </label>
                          </div>
                          <div className="mb-3">
                            <input
                              type="radio"
                              {...field}
                              className="sr-only peer"
                              value="2"
                              id="answer_paypal"
                            />
                            <label
                              className="flex p-5 bg-white border rounded-lg cursor-pointer focus:outline-none hover:bg-gray-50 peer-checked:ring-gray-700 peer-checked:ring-2 peer-checked:border-transparent"
                              htmlFor="answer_paypal"
                            >
                              <div className="flex items-center">
                                <img
                                  src={Paypal}
                                  alt="Paypal"
                                  className="w-12 h-5 mr-2"
                                />
                                <div className="text-sm">Paypal</div>
                              </div>
                            </label>
                          </div>
                          <div className="mb-3 relative">
                            <input
                              type="radio"
                              {...field}

                              className="sr-only peer"
                              defaultChecked
                              value="2"
                              id="answer_visa"
                            />
                            <label
                              className="flex p-5 bg-white border rounded-lg cursor-pointer focus:outline-none hover:bg-gray-50 peer-checked:ring-gray-700 peer-checked:ring-2 peer-checked:border-transparent"
                              htmlFor="answer_visa"
                            >
                              <div className="flex items-center">
                                <img
                                  src={Visa}
                                  alt="VISA"
                                  className="w-12 h-4 mr-2"
                                />
                                <div className="text-sm">Visa </div>
                              </div>
                            </label>
                          </div>
                          <div className="mb-3 relative">
                            <input
                              type="radio"
                              {...field}

                              className="sr-only peer"
                              defaultChecked
                              value="1"
                              id="answer_cash-trade"
                            />
                            <label
                              className="flex p-5 bg-white border rounded-lg cursor-pointer focus:outline-none hover:bg-gray-50 peer-checked:ring-gray-700 peer-checked:ring-2 peer-checked:border-transparent"
                              htmlFor="answer_cash-trade"
                            >
                              <div className="flex items-center">
                                <img
                                  src={CashTrade}
                                  alt="VISA"
                                  className="w-12 h-4 mr-2"
                                />
                                <div className="text-sm">代金引換 </div>
                              </div>
                            </label>
                          </div>
                        </div>
                      </>
                    )}
                  />
                  {errors.paymentMethod && <p>{errors.paymentMethod.message}</p>}
                </div>
                <br />

                <div className="flex justify-between mt-6 mb-6">
                  <button
                    type="submit"
                    //disabled={isSubmitting}
                    className={`relative px-6 py-2 ${buttonColor} text-white rounded-sm focus:outline-none overflow-hidden group` }
                    onClick={() => setButtonColor('bg-gray-500')}
                    style={{width:'24%'}}
                  >
                    <span className="absolute top-0 left-0 w-0 h-0 transition-all duration-200 border-t-2 border-gray-700 group-hover:w-full ease"></span>
                    <span className="absolute bottom-0 right-0 w-0 h-0 transition-all duration-200 border-b-2 border-gray-700 group-hover:w-full ease"></span>
                    <span className="absolute top-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-700 group-hover:h-full ease"></span>
                    <span className="absolute bottom-0 left-0 w-full h-0 transition-all duration-300 delay-200 bg-gray-700 group-hover:h-full ease"></span>
                    <span className="absolute inset-0 w-full h-full duration-300 delay-300 bg-gray-900 opacity-0 group-hover:opacity-100"></span>
                    <span className="relative transition-colors duration-300 delay-200 group-hover:text-white ease">注文</span>
                  </button>
                  <button
                    type="reset"
                    className="px-6 py-2 bg-gray-500 text-white rounded-sm focus:outline-none hover:bg-gray-400"
                    onClick={handleBackClick}
                    style={{width:'27%'}}
                  >
                    トップへ戻る
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <LoginModal show={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
};

export default OrderConfirm;