import React, { useState, FormEvent } from 'react';
import axios from 'axios';

const Login: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [message, setMessage] = useState<string>('');
    const [token, setToken] = useState<string>('');

    const handleLogin = async (event: FormEvent) => {
        event.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/ec-202404c/users', { username, password });
            setToken(response.data);
            setMessage('Login successful!');
        } catch (error) {
            setMessage('Login failed.');
        }
    };

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Username: </label>
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        required 
                    />
                </div>
                <div>
                    <label>Password: </label>
                    <input 
                        type="password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                </div>
                <button type="submit">Login</button>
            </form>
            {message && <p>{message}</p>}
            {token && <p>Token: {token}</p>}
        </div>
    );
};

export default Login;