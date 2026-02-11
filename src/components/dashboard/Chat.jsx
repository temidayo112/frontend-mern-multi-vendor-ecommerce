import React, { useEffect, useRef, useState } from 'react';
import { AiOutlineMessage, AiOutlinePlus } from 'react-icons/ai'
import { GrEmoji } from 'react-icons/gr'
import { IoSend } from 'react-icons/io5'
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom'
import { add_friend, messageClear, send_message,updateMessage } from '../../store/reducers/chatReducer';
import toast from 'react-hot-toast';
import io from 'socket.io-client'
import {FaList} from 'react-icons/fa'

const socket = io('http://localhost:5000')

const Chat = () => {

    const scrollRef = useRef()

    const dispatch = useDispatch()
    const {sellerId} = useParams()
    const {userInfo } = useSelector(state => state.auth)
    const {fb_messages,currentFd,my_friends,successMessage } = useSelector(state => state.chat)
    const [text,setText] = useState('')
    const [receverMessage,setReceverMessage] = useState('')
    const [activeSeller,setActiveSeller] = useState([])
    const [show, setShow] = useState(false)
    
    useEffect(() => {
        socket.emit('add_user',userInfo.id, userInfo)
    },[])

    useEffect(() => {
        dispatch(add_friend({
            sellerId: sellerId || "",
            userId: userInfo.id
        }))
    },[sellerId])

    const send = () => {
        if (text) {
            dispatch(send_message({
                userId: userInfo.id,
                text,
                sellerId,
                name: userInfo.name 
            }))
            setText('')
        }
    }

    useEffect(() => {
        socket.on('seller_message', msg => {
            setReceverMessage(msg)
        })
        socket.on('activeSeller', (sellers) => {
            setActiveSeller(sellers)
        })
    },[])

    useEffect(() => {
        if (successMessage) {
            socket.emit('send_customer_message',fb_messages[fb_messages.length - 1])
            dispatch(messageClear())
        }
    },[successMessage])

    useEffect(() => {
        if (receverMessage) {
            if (sellerId === receverMessage.senderId && userInfo.id === receverMessage.receverId) {
                dispatch(updateMessage(receverMessage))
            } else {
                toast.success(receverMessage.senderName + " " + "Send A message")
                dispatch(messageClear())
            }
        }

    },[receverMessage])
    
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth'})
    },[fb_messages])

    return (
        <div className='bg-white p-3 rounded-md'>
    <div className='w-full flex'>
       
        {/* <div className='w-[230px] md-lg:absolute bg-white md-lg:h-full -left-[0px]'> */}
         <div className={`w-[230px] md-lg:absolute bg-white md-lg:h-full -left-[350px] ${show ? 'left-0' : '-left-[350px]'}`}>
            <div className='flex justify-center gap-3 items-center text-slate-600 text-xl h-[50px]'>
                <span><AiOutlineMessage /></span>
                <span>Message</span>
            </div>
            <div className='w-full flex flex-col text-slate-600 py-4 h-[400px] pr-3'>
               {
                my_friends.map((f,i) => <Link to={`/dashboard/chat/${f.fdId}`} key={i}  className={`flex gap-2 justify-start items-center pl-2 py-[5px]`} >
                <div className='w-[30px] h-[30px] rounded-full relative'>
                   
                   {
                    activeSeller.some(c => c.sellerId === f.fdId ) && <div className='w-[10px] h-[10px] rounded-full bg-green-500 absolute right-0 bottom-0'></div> 
                   } 
                    
                    <img src={f.image} alt="" />
                </div>
                <span>{f.name}</span>
            </Link> )
               }
                
            </div>
        </div>

        <div className='w-[calc(100%-230px)] md-lg:w-full'>
            {
                currentFd ? <div className='w-full h-full'>
                <div className='flex justify-between gap-3 items-center text-slate-600 text-xl h-[50px]'>
           
            <div className='flex gap-2'>
            <div className='w-[30px] h-[30px] rounded-full relative'>
            {
            activeSeller.some(c => c.sellerId === currentFd.fdId) && <div className='w-[10px] h-[10px] rounded-full bg-green-500 absolute right-0 bottom-0'></div>
            } 
              <img src={currentFd.image} />
                    </div>
                    <span>{currentFd.name}</span>
                
            </div> 

                <div onClick={()=> setShow(!show)} className='w-[35px] h-[35px] hidden md-lg:flex cursor-pointer rounded-sm justify-center
                 items-center bg-sky-500 text-white'>
                    <FaList/>
                </div>      
               
                </div>
                <div className='h-[400px] w-full bg-slate-100 p-3 rounded-md'>
                    <div className='w-full h-full overflow-y-auto flex flex-col gap-3'>

        {
            fb_messages.map((m, i) => {
                if (currentFd?.fdId !== m.receverId) {
                    return(
                 <div ref={scrollRef} key={i} className='w-full flex gap-2 justify-start items-center text-[14px]'>
            <img className='w-[30px] h-[30px] ' src="http://localhost:3000/images/user.png" alt="" />
            <div className='p-2 bg-purple-500 text-white rounded-md'>
                <span>{m.message}</span>
            </div>
        </div>
              )     
                }else{ 
                  return (
                    <div ref={scrollRef} key={i} className='w-full flex gap-2 justify-end items-center text-[14px]'>
                    <img className='w-[30px] h-[30px] ' src="http://localhost:3000/images/user.png" alt="" />
                    <div className='p-2 bg-cyan-500 text-white rounded-md'>
                        <span>{m.message}</span>
                    </div>
                </div> 
                  ) 
                }
            })
        } 
                    </div>
                </div>
                <div className='flex p-2 justify-between items-center w-full'>
                    <div className='w-[40px] h-[40px] border p-2 justify-center items-center flex rounded-full'>
                        <label className='cursor-pointer' htmlFor=""><AiOutlinePlus /></label>
                        <input className='hidden' type="file" />
                    </div>
                    <div className='border h-[40px] p-0 ml-2 w-[calc(100%-90px)] rounded-full relative'>
                        <input value={text} onChange={(e) => setText(e.target.value)} type="text" placeholder='input message' className='w-full rounded-full h-full outline-none p-3' />
                        <div className='text-2xl right-2 top-2 absolute cursor-auto'>
                            <span><GrEmoji /></span>
                        </div>

                    </div>
                    <div className='w-[40px] p-2 justify-center items-center rounded-full'>
                        <div onClick={send} className='text-2xl cursor-pointer'>
                            <IoSend />
                        </div>
                    </div>
                </div>
            </div> : <div onClick={() => setShow(true)} className='w-full h-[400px] flex justify-center items-center text-lg ont-bold text-slate-600'>
                <span>Select Seller</span>
            </div>
            }
            
        </div>
    </div>
        </div>
    );
};

export default Chat;

























// import React, { useEffect, useRef, useState } from 'react';
// import { AiOutlineMessage, AiOutlinePlus } from 'react-icons/ai'
// import { GrEmoji } from 'react-icons/gr'
// import { IoSend } from 'react-icons/io5'
// import { useDispatch, useSelector } from 'react-redux';
// import { Link, useParams } from 'react-router-dom'
// import { add_friend, messageClear, send_message, updateMessage } from '../../store/reducers/chatReducer';
// import toast from 'react-hot-toast';
// import io from 'socket.io-client'
// import { FaList } from 'react-icons/fa'

// const socket = io('http://localhost:5000')

// const Chat = () => {
//     const scrollRef = useRef()
//     const dispatch = useDispatch()
//     const { sellerId } = useParams()
//     const { userInfo } = useSelector(state => state.auth)
//     const { fb_messages, currentFd, my_friends, successMessage } = useSelector(state => state.chat)
//     const [text, setText] = useState('')
//     const [receverMessage, setReceverMessage] = useState('')
//     const [activeSeller, setActiveSeller] = useState([])
//     const [show, setShow] = useState(false)
    
//     useEffect(() => {
//         socket.emit('add_user', userInfo.id, userInfo)
//     }, [])

//     useEffect(() => {
//         dispatch(add_friend({
//             sellerId: sellerId || "",
//             userId: userInfo.id
//         }))
//     }, [sellerId])

//     const send = () => {
//         if (text.trim()) {
//             dispatch(send_message({
//                 userId: userInfo.id,
//                 text,
//                 sellerId,
//                 name: userInfo.name 
//             }))
//             setText('')
//         }
//     }

//     useEffect(() => {
//         socket.on('seller_message', msg => {
//             setReceverMessage(msg)
//         })
//         socket.on('activeSeller', (sellers) => {
//             setActiveSeller(sellers)
//         })
//     }, [])

//     useEffect(() => {
//         if (successMessage) {
//             socket.emit('send_customer_message', fb_messages[fb_messages.length - 1])
//             dispatch(messageClear())
//         }
//     }, [successMessage])

//     useEffect(() => {
//         if (receverMessage) {
//             if (sellerId === receverMessage.senderId && userInfo.id === receverMessage.receverId) {
//                 dispatch(updateMessage(receverMessage))
//             } else {
//                 toast.success(receverMessage.senderName + " " + "Send A message")
//                 dispatch(messageClear())
//             }
//         }
//     }, [receverMessage])
    
//     useEffect(() => {
//         scrollRef.current?.scrollIntoView({ behavior: 'smooth'})
//     }, [fb_messages])

//     return (
//         <div className='bg-white p-2 md:p-3 rounded-md h-[calc(100vh-100px)] md:h-auto'>
//             <div className='w-full flex relative h-full'>
//                 {/* Sidebar - Mobile: sliding drawer, Desktop: always visible */}
//                 <div className={`w-[280px] md:w-[230px] fixed md:relative top-0 left-0 h-full bg-white shadow-xl md:shadow-none
//  transition-transform duration-300 z-40 
//                     ${show ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
//                     <div className='flex justify-center gap-3 items-center text-slate-600 text-lg md:text-xl h-[50px] border-b px-4'>
//                         <AiOutlineMessage className='text-xl' />
//                         <span className='font-semibold'>Messages</span>
//                     </div>
//                     <div className='w-full flex flex-col text-slate-600 py-3 h-[calc(100vh-130px)] md:h-[400px] pr-2 overflow-y-auto'>
//                         {my_friends.length > 0 ? (
//                             my_friends.map((f, i) => (
//                                 <Link 
//                                     to={`/dashboard/chat/${f.fdId}`} 
//                                     key={i}  
//                                     className={`flex gap-3 justify-start items-center pl-3 py-3 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-100 last:border-b-0 ${
//                                         currentFd?.fdId === f.fdId ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
//                                     }`}
//                                     onClick={() => setShow(false)}
//                                 >
//                                     <div className='w-10 h-10 md:w-8 md:h-8 rounded-full relative flex-shrink-0'>
//                                         {activeSeller.some(c => c.sellerId === f.fdId) && (
//                                             <div className='w-3 h-3 md:w-2 md:h-2 rounded-full bg-green-500 absolute right-0 bottom-0 border-2 border-white'></div>
//                                         )}
//                                         <img 
//                                             className='w-full h-full rounded-full object-cover'
//                                             src={f.image} 
//                                             alt={f.name}
//                                             onError={(e) => {
//                                                 e.target.onerror = null;
//                                                 e.target.src = "http://localhost:3000/images/user.png";
//                                             }}
//                                         />
//                                     </div>
//                                     <div className='flex-1 min-w-0'>
//                                         <p className='font-medium text-sm md:text-base truncate'>{f.name}</p>
//                                         {activeSeller.some(c => c.sellerId === f.fdId) && (
//                                             <p className='text-xs text-green-600 mt-0.5'>Online now</p>
//                                         )}
//                                     </div>
//                                 </Link>
//                             ))
//                         ) : (
//                             <div className='flex flex-col items-center justify-center h-full text-gray-400 p-4 text-center'>
//                                 <AiOutlineMessage className='text-4xl mb-3' />
//                                 <p className='text-sm'>No friends yet</p>
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 {/* Overlay for mobile */}
//                 {show && (
//                     <div 
//                         className='fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden'
//                         onClick={() => setShow(false)}
//                     ></div>
//                 )}

//                 {/* Main Chat Area */}
//                 <div className='flex-1 h-full md:ml-3'>
//                     {currentFd ? (
//                         <div className='flex flex-col h-full'>
//                             {/* Chat Header - Mobile optimized */}
//                             <div className='flex items-center justify-between bg-white p-3 md:p-0 md:mb-3 border-b md:border-none sticky top-0 z-20'>
//                                 <div className='flex items-center gap-3'>
//                                     {/* Mobile menu button */}
//                                     <button 
//                                         onClick={() => setShow(!show)}
//                                         className='w-10 h-10 flex md:hidden items-center justify-center rounded-lg bg-sky-500 text-white hover:bg-sky-600 active:bg-sky-700'
//                                         aria-label='Toggle menu'
//                                     >
//                                         <FaList className='text-lg' />
//                                     </button>
                                    
//                                     <div className='flex items-center gap-2 md:gap-3'>
//                                         <div className='w-10 h-10 md:w-9 md:h-9 rounded-full relative'>
//                                             {activeSeller.some(c => c.sellerId === currentFd.fdId) && (
//                                                 <div className='w-3 h-3 md:w-2 md:h-2 rounded-full bg-green-500 absolute right-0 bottom-0 border-2 border-white'></div>
//                                             )}
//                                             <img 
//                                                 className='w-full h-full rounded-full object-cover'
//                                                 src={currentFd.image} 
//                                                 alt={currentFd.name}
//                                                 onError={(e) => {
//                                                     e.target.onerror = null;
//                                                     e.target.src = "http://localhost:3000/images/user.png";
//                                                 }}
//                                             />
//                                         </div>
//                                         <div>
//                                             <h3 className='font-semibold text-sm md:text-base text-gray-800'>{currentFd.name}</h3>
//                                             <div className='flex items-center gap-2'>
//                                                 {activeSeller.some(c => c.sellerId === currentFd.fdId) ? (
//                                                     <div className='flex items-center gap-1'>
//                                                         <div className='w-2 h-2 rounded-full bg-green-500'></div>
//                                                         <p className='text-xs text-green-600'>Online</p>
//                                                     </div>
//                                                 ) : (
//                                                     <p className='text-xs text-gray-500'>Offline</p>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Messages Container - Responsive height */}
//                             <div className='flex-1 bg-gray-50 rounded-lg md:rounded-xl p-3 md:p-4 mb-3 md:mb-4 overflow-hidden'>
//                                 <div className='w-full h-full overflow-y-auto flex flex-col gap-3 md:gap-4 px-1'>
//                                     {fb_messages.length > 0 ? (
//                                         fb_messages.map((m, i) => {
//                                             const isSender = currentFd?.fdId !== m.receverId;
//                                             const isLastMessage = i === fb_messages.length - 1;
//                                             return (
//                                                 <div 
//                                                     ref={isLastMessage ? scrollRef : null} 
//                                                     key={i} 
//                                                     className={`flex ${isSender ? 'justify-start' : 'justify-end'}`}
//                                                 >
//                                                     <div className={`flex items-end gap-2 max-w-[85%] md:max-w-[70%] ${isSender ? 'flex-row' : 'flex-row-reverse'}`}>
//                                                         <div className={`px-3 md:px-4 py-2 md:py-2.5 rounded-2xl text-sm md:text-base ${isSender ? 'bg-blue-500 text-white rounded-bl-sm' : 'bg-gray-200 text-gray-800 rounded-br-sm'}`}>
//                                                             <span className='break-words'>{m.message}</span>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             );
//                                         })
//                                     ) : (
//                                         <div className='flex flex-col items-center justify-center h-full text-gray-400 p-4 text-center'>
//                                             <AiOutlineMessage className='text-4xl mb-3 opacity-50' />
//                                             <p className='text-gray-500'>No messages yet</p>
//                                             <p className='text-sm text-gray-400 mt-1'>Start the conversation!</p>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Message Input - Mobile optimized */}
//                             <div className='flex items-center gap-2 bg-white p-2 md:p-0'>
//                                 <button className='w-12 h-12 md:w-10 md:h-10 flex items-center justify-center rounded-full border border-gray-300 hover:bg-gray-50 active:bg-gray-100 transition-colors'>
//                                     <AiOutlinePlus className='text-gray-600 text-lg md:text-base' />
//                                     <input className='hidden' type="file" />
//                                 </button>
//                                 <div className='flex-1 relative'>
//                                     <input 
//                                         value={text}
//                                         onChange={(e) => setText(e.target.value)}
//                                         onKeyPress={(e) => e.key === 'Enter' && send()}
//                                         type="text" 
//                                         placeholder='Type a message...' 
//                                         className='w-full h-12 md:h-10 rounded-full border border-gray-300 outline-none px-4 md:px-4 pr-12 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-sm md:text-base'
//                                     />
//                                     <button className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 active:text-gray-800'>
//                                         <GrEmoji className='text-xl md:text-lg' />
//                                     </button>
//                                 </div>
//                                 <button 
//                                     onClick={send}
//                                     disabled={!text.trim()}
//                                     className='w-12 h-12 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed'
//                                 >
//                                     <IoSend className='text-lg md:text-base' />
//                                 </button>
//                             </div>
//                         </div>
//                     ) : (
//                         <div className='w-full h-full flex flex-col items-center justify-center text-center p-4'>
//                             <div className='text-gray-300 mb-4'>
//                                 <AiOutlineMessage className='text-6xl md:text-7xl' />
//                             </div>
//                             <h3 className='text-lg md:text-xl font-semibold text-gray-600 mb-2'>Select a seller to chat</h3>
//                             <p className='text-gray-500 text-sm md:text-base mb-6 max-w-md'>Choose a seller from your friends list to start messaging</p>
//                             <button 
//                                 onClick={() => setShow(true)}
//                                 className='px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors font-medium md:hidden'
//                             >
//                                 Open Friends List
//                             </button>
//                             <p className='text-gray-400 text-sm mt-4 md:hidden'>Tap the menu icon in the header to open friends list</p>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Chat;