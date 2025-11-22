import { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
    'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

export default function Calendar() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            // Fetch all posts with scheduling info
            const response = await axios.get('/api/posts/all');
            const posts = response.data;

            const calendarEvents = posts
                .filter(post => post.scheduled_at || post.published_at)
                .map(post => {
                    const date = post.published_at || post.scheduled_at;
                    const isPublished = post.status === 'published';

                    return {
                        id: post.id,
                        title: `${post.platform_display_name}: ${post.content.substring(0, 40)}...`,
                        start: new Date(date),
                        end: new Date(date),
                        resource: {
                            ...post,
                            color: isPublished ? '#10b981' : '#6366f1'
                        }
                    };
                });

            setEvents(calendarEvents);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching posts:', err);
            setLoading(false);
        }
    };

    const handleSelectEvent = (event) => {
        navigate(`/preview/${event.resource.brief_id}`);
    };

    const eventStyleGetter = (event) => {
        return {
            style: {
                backgroundColor: event.resource.color,
                borderRadius: '4px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '12px',
                padding: '2px 4px'
            }
        };
    };

    if (loading) return <div className="loading">Loading calendar...</div>;

    return (
        <div className="container">
            <div style={{ marginBottom: '20px' }}>
                <h1 style={{ marginBottom: '8px' }}>Publication Calendar</h1>
                <p className="text-secondary">View all scheduled and published posts</p>
            </div>

            <div className="card" style={{ padding: '20px', minHeight: '600px' }}>
                <div style={{ marginBottom: '16px', display: 'flex', gap: '16px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#6366f1', borderRadius: '2px' }}></div>
                        <span>Scheduled</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <div style={{ width: '12px', height: '12px', background: '#10b981', borderRadius: '2px' }}></div>
                        <span>Published</span>
                    </div>
                </div>

                <BigCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '550px' }}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    views={['month', 'week', 'day', 'agenda']}
                    defaultView="month"
                />
            </div>
        </div>
    );
}
