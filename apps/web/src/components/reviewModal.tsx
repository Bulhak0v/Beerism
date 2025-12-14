import React, { useState, useEffect } from 'react';
import '../styles/reviews.css';
import { useAuth } from './authProvider';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    locationId: number;
    locationName: string;
    onReviewAdded: () => void;
    initialData?: { review_id: number, rating: number, text: string };
}

const ReviewModal: React.FC<ReviewModalProps> = ({ 
    isOpen, onClose, locationId, locationName, onReviewAdded, initialData 
}) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [text, setText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (initialData) {
            setRating(initialData.rating);
            setText(initialData.text);
        } else {
            setRating(0);
            setText("");
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!user) return alert("Please login first");
        if (rating === 0) return alert("Please select a rating");

        setIsSubmitting(true);
        try {
            const url = 'https://beerism-backend.onrender.com/api/reviews';
            const method = initialData ? 'PUT' : 'POST';
            
            const body: any = {
                user_id: user.user_id,
                rating: rating,
                review_text: text
            };

            if (initialData) {
                body.review_id = initialData.review_id;
            } else {
                body.location_id = locationId;
            }

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            if (res.ok) {
                onReviewAdded();
                onClose();
            } else if (res.status === 409) {
                alert("You have already reviewed this location.");
            } else {
                alert("Failed to submit review");
            }
        } catch (e) {
            console.error(e);
            alert("Error submitting review");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="review-modal-overlay" onClick={onClose}>
            <div className="review-modal" onClick={e => e.stopPropagation()}>
                <h3>{initialData ? "Edit Review" : "Review"} for {locationName}</h3>
                
                <div className="star-input-wrapper">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                            key={star} 
                            onClick={() => setRating(star)}
                            className={star <= rating ? "star-filled" : "star-empty"}
                        >
                            ★
                        </span>
                    ))}
                </div>

                <textarea 
                    className="review-textarea"
                    placeholder="Share your experience... (supports <b>bold</b> and <i>italic</i> tags)"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                <div className="review-modal-actions">
                    <button className="review-cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="review-submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
                        {initialData ? "Save Changes" : "Post Review"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;