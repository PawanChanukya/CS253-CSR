import { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

export default function TravelChatRoom() {
    const navigate = useNavigate();
    const socket = useRef(null);
    const location = useLocation();

    const { trip_name, destination } = location.state;
    const [info, setInfo] = useState({});
    const [message, setMessage] = useState('');
    const [username, setUsername] = useState('Anonymous'); 
    
    const [messages, setMessages] = useState([
        { username: 'Admin', message: 'Cross Site Scripting Not Allowed!' },
        { username: 'Admin', message: 'This website has very weak security' },
        { username: 'Admin', message: 'So, DON\'T try to break it.' },
    ]);

    useEffect(() => {
        socket.current = io(`ws://${process.env.REACT_APP_IP}:8080`); 
        socket.current.on('message', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
        });
        return () => {
            socket.current.disconnect();
        };
    }, []);

    const handleKeyPress = (event) => {
        if (event.key === 'Enter' && message !== '') {
            socket.current.emit('message', {
                username: username,
                message: trip_name + destination +message,
            });
            setMessage('');
        }
    };

    const handleButtonSend = () =>{
        socket.current.emit('message', {
            username: username,
            message: trip_name + destination +message,
        });
        setMessage('');
    }

    const handleBackPage = () => {
        navigate('/travelInfo', {
            state: {
                trip_name: trip_name,
                destination: destination,
            }
        });
    };

    useEffect(() => {
        fetch(`http://${process.env.REACT_APP_IP}:8000/api/login`, {
            credentials: 'include'
        })
        .then((res) => res.json())
        .then((data) => setInfo(data));
    }, []);  

    useEffect(() => {
        fetch(`http://${process.env.REACT_APP_IP}:8000/api/user/name`, {
            credentials: 'include'
        })
        .then((res) => res.json())
        .then((data) => setUsername(data.name));
    }, []);

    if(!info.status){
        navigate('/home');
        return null;
    } else {
        if(!info.loggedIn){
            navigate('/home');
            return null;
        } else {
            return (
                <div>
                    <h1 className='text-center'>Hi! {username}, Let's Chat</h1>
                    <h2 className='text-center'>{trip_name}</h2>
                    <h2 className='text-center'>Destination : {destination}</h2>
                    <ul>
                        {messages.map((message, index) => {
                            if (message.message.startsWith(trip_name + destination)) {
                                const newMessage = message.message.substring((trip_name + destination).length);
                                return (
                                    <li key={index} className="user-message">
                                        <span className="user">{message.username}:</span>
                                        <span className="message">{newMessage}</span>
                                    </li>
                                );
                            } else {
                                return null;
                            }
                        })}
                    </ul>
                    <input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={handleKeyPress} placeholder="message" />
                    <button className="btn btn-primary mt-3" onClick={handleButtonSend}>Send</button>

                    <div className="d-flex justify-content-center">
                        <button className="btn btn-primary mt-3" onClick={handleBackPage}>Go Back</button>
                    </div>
                </div>
            );
        }
    }
}