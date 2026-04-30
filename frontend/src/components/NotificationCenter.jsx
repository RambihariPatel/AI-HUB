import React, { useState, useEffect } from 'react';
import { Bell, X, Info, TrendingDown, Zap, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationCenter = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/api/notifications');
            setNotifications(data);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Set up interval for "real-time" feel (every 30s)
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const markAsRead = async (id) => {
        try {
            await api.put(`/api/notifications/${id}/read`);
            setNotifications(notifications.map(n => 
                n._id === id ? { ...n, isRead: true } : n
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    const markAllRead = async () => {
        try {
            await api.put('/api/notifications/read-all');
            setNotifications(notifications.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl hover:bg-muted transition-all border border-transparent hover:border-border group"
            >
                <Bell className={`w-5 h-5 ${unreadCount > 0 ? 'text-blue-600 animate-pulse' : 'text-muted-foreground'}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                    </span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                                <h3 className="font-bold text-sm flex items-center gap-2">
                                    <Bell size={16} className="text-blue-600" /> Notifications
                                    {unreadCount > 0 && <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                                </h3>
                                <div className="flex gap-2">
                                    {unreadCount > 0 && (
                                        <button 
                                            onClick={markAllRead}
                                            className="text-[10px] font-bold text-blue-600 hover:underline"
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-10 text-center flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                                            <Bell size={24} className="text-muted-foreground/50" />
                                        </div>
                                        <p className="text-sm text-muted-foreground">No notifications yet</p>
                                        <button 
                                            onClick={async () => {
                                                await api.get('/api/notifications/seed-test');
                                                fetchNotifications();
                                            }}
                                            className="mt-2 text-[10px] font-bold text-blue-600 hover:underline px-3 py-1 border border-blue-600/20 rounded-lg"
                                        >
                                            Seed Test Notifications
                                        </button>
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <div 
                                            key={n._id}
                                            onClick={() => markAsRead(n._id)}
                                            className={`p-4 border-b border-border last:border-0 hover:bg-muted/50 transition-colors cursor-pointer relative group ${!n.isRead ? 'bg-blue-500/[0.03]' : ''}`}
                                        >
                                            {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600"></div>}
                                            <div className="flex gap-3">
                                                <div className={`mt-1 h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                                                    n.type === 'price_drop' ? 'bg-green-100 text-green-600' : 
                                                    n.type === 'feature_update' ? 'bg-purple-100 text-purple-600' : 
                                                    'bg-blue-100 text-blue-600'
                                                }`}>
                                                    {n.type === 'price_drop' ? <TrendingDown size={16} /> : 
                                                     n.type === 'feature_update' ? <Zap size={16} /> : 
                                                     <Info size={16} />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-foreground truncate">{n.title}</p>
                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{n.message}</p>
                                                    <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                                                        {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                {!n.isRead && (
                                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Check size={14} className="text-blue-600" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-3 bg-muted/30 border-t border-border text-center">
                                <Link to="/profile" onClick={() => setIsOpen(false)} className="text-[10px] font-bold text-muted-foreground hover:text-blue-600 transition-colors">
                                    VIEW ACCOUNT SETTINGS
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
