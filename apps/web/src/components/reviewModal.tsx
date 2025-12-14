import React, { useState } from 'react';
import '../styles/reviews.css';
import { useAuth } from './authProvider';

interface ReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    locationId: number;
    locationName: string;
    onReviewAdded: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ isOpen, onClose, locationId, locationName, onReviewAdded }) => {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [text, setText] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!user) return alert("Please login first");
        if (rating === 0) return alert("Please select a rating");

        setIsSubmitting(true);
        try {
            const res = await fetch('https://beerism-backend.onrender.com/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.user_id,
                    location_id: locationId,
                    rating: rating,
                    review_text: text
                })
            });

            if (res.ok) {
                onReviewAdded();
                setRating(0);
                setText("");
                onClose();
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
                <h3>Review for {locationName}</h3>
                
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
                    placeholder="Write your experience here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />

                <div className="review-modal-actions">
                    <button className="review-cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="review-submit-btn" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Posting..." : "Post Review"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewModal;