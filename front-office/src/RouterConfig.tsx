import { BrowserRouter, Route, Routes } from 'react-router-dom';
import App from './App.tsx'
import Register from './component/Register.tsx';
import Login from './component/Login.tsx';
import { validationSchema } from "./utils/validationSchema.ts";
import Order_cconfirm from './component/order_confirm.tsx';
import Order_finished from './component/order_finished.tsx';

export const RouterConfig = () => {
    return (
        <>

                <BrowserRouter>
                    <Routes>
                        <Route path='/' element={<App/>} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/order_confirm" element={<Order_cconfirm />} />
                        <Route path="/order_finished" element={<Order_finished />} />
                    
                        
                        {/* <Route path="/room/:room_id" element={<ChatGUI />} /> */}
                    </Routes>
                </BrowserRouter>
        </>
    );
};