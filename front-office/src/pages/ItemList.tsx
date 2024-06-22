import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Item from '../components/Item';
import axios from 'axios';
import Navbar from '../components/layout/Navbar';
import SearchForm from '../components/SearchForm';
import { HOST_IP } from '../config';

const ItemList: React.FC = () => {
  const { type } = useParams();
  const [items, setItems] = useState([]);

  useEffect(() => {
    console.log(HOST_IP);
    const getChatsAsync = async () => {
        const response = await axios.get(`http://${HOST_IP}:8080/ec-202404c/items/${type}`); 
        setItems(response.data.items);
    }
    getChatsAsync();
}, [type])
  

  return (
    <div style={{width:"100%"}}>
      <div>
        {/* <Navbar /> */}
        <SearchForm />
        <div className="columns is-multiline is-centered">
          {items.map((item, index) => (
            <Item key={index} item={item} />
              
          ))}
        </div>
      </div>
    </div>
  )
};

export default ItemList;
