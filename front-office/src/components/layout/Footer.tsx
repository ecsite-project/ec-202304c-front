import React from "react";
import { Link } from "react-router-dom"; // Linkコンポーネントのインポート
import AmericanExpress from "../../assets/AmericanExpress.svg";
import MasterCard from "../../assets/MasterCard.svg";
import PayPal from "../../assets/PayPal.svg";
import Visa from "../../assets/Visa.svg";

const Footer: React.FC = () => {
  return (
    <footer
      className="footer p-10 bg-gray-200 mt-10"
      style={{ position: "relative" }}
    >
      <div
        className="container mx-auto flex justify-between items-center"
        style={{ width: "80%" }}
      >
        <aside className="flex items-center">
          <Link
            to="/item-list"
            className="text-5xl text-blue-gray-900 font-poiret font-semibold"
            title="一覧画面に遷移"
          >
            R<span className="text-orange-900 font-bold">a</span>kuStyle
          </Link>
          <p className="ml-8 text-blue-gray-700 font-medium">
            © 2024 RakuStyle. All Rights Reserved.
          </p>
        </aside>
        <nav>
          <h6 className="footer-title">
            ご利用いただける決済方法(代引きも可能)
          </h6>
          <div className="grid grid-flow-col gap-4">
            {[
              { src: AmericanExpress, alt: "American Express" },
              { src: MasterCard, alt: "MasterCard" },
              { src: PayPal, alt: "PayPal" },
              { src: Visa, alt: "Visa" },
            ].map((card) => (
              <a
                key={card.alt}
                className="relative border-2 border-gray-300 rounded-lg p-2 group"
              >
                <img
                  src={card.src}
                  className="w-14 h-7 fill-current"
                  alt={card.alt}
                />
                <span className="absolute left-1/2 bottom-full mb-2 hidden w-auto px-2 py-1 text-sm text-white bg-black rounded-lg transform -translate-x-1/2 group-hover:block">
                  {card.alt}
                </span>
              </a>
            ))}
          </div>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
