import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import axios from 'axios';
import { Star, ArrowLeft } from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';

const PromptDetail = () => {
  const { id } = useParams();
  const [prompt, setPrompt] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ratingForm, setRatingForm] = useState({
    rating: 5,
    feedback: '',
    user_name: '',
    user_email: ''
  });
  const [hoveredStar, setHoveredStar] = useState(0);

  useEffect(() => {
    fetchPrompt();
    fetchRatings();
  }, [id]);

  const fetchPrompt = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/prompti/${id}`);
      setPrompt(response.data);
    } catch (error) {
      toast.error('Failed to fetch prompt');
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    try {
      const response = await axios.get(`${API_URL}/public/prompti/${id}/ratings`);
      setRatings(response.data);
    } catch (error) {
      console.error('Failed to fetch ratings');
    }
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${API_URL}/public/prompti/${id}/rate`, {
        ...ratingForm,
        prompti_id: id
      });
      toast.success('Rating submitted successfully!');
      setRatingForm({ rating: 5, feedback: '', user_name: '', user_email: '' });
      fetchPrompt();
      fetchRatings();
    } catch (error) {
      toast.error('Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (interactive = false) => {
    const activeRating = interactive ? (hoveredStar || ratingForm.rating) : ratingForm.rating;
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`star ${star <= activeRating ? 'filled' : ''}`}
            size={interactive ? 32 : 20}
            fill={star <= activeRating ? '#F58634' : 'none'}
            onClick={() => interactive && setRatingForm({ ...ratingForm, rating: star })}
            onMouseEnter={() => interactive && setHoveredStar(star)}
            onMouseLeave={() => interactive && setHoveredStar(0)}
            style={{ cursor: interactive ? 'pointer' : 'default' }}
            data-testid={`star-${star}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="loader"></div>;
  }

  if (!prompt) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#53435B] text-lg">Prompt not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <Navbar isPublic />

      <div className="container py-12">
        <Link to="/" className="inline-flex items-center gap-2 text-[#811622] hover:underline mb-6 font-semibold" data-testid="back-link">
          <ArrowLeft size={20} />
          Back to Prompti Vault
        </Link>

        <Card className="p-8 mb-8" data-testid="prompti-detail">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-[#811622] mb-4" style={{ fontFamily: 'Manrope' }}>
                {prompt.title}
              </h1>
              <div className="flex items-center gap-4 mb-4">
                <Badge className="bg-[#f7e2d1] text-[#811622]">{prompt.category_name}</Badge>
                {prompt.tag_names.map((tag, idx) => (
                  <span key={idx} className="tag-badge">
                    {tag}
                  </span>
                ))}
              </div>
              <p className="text-sm text-[#53435B]">By {prompt.author_name}</p>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2 text-[#F58634] mb-2">
                <Star size={32} fill="#F58634" />
                <span className="text-3xl font-bold">{prompt.average_rating.toFixed(1)}</span>
              </div>
              <p className="text-sm text-[#53435B]">({prompt.rating_count} ratings)</p>
            </div>
          </div>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-bold text-[#811622] mb-4" style={{ fontFamily: 'Manrope' }}>Prompt</h2>
            <div className="bg-[#f7e2d1] p-6 rounded-lg">
              <pre className="whitespace-pre-wrap font-mono text-[#53435B]">{prompt.body}</pre>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-8" data-testid="rating-form">
            <h2 className="text-2xl font-bold text-[#811622] mb-6" style={{ fontFamily: 'Manrope' }}>Rate This Prompti</h2>
            <form onSubmit={handleSubmitRating} className="space-y-6">
              <div>
                <Label>Your Rating</Label>
                <div className="mt-2">
                  {renderStars(true)}
                </div>
              </div>

              <div>
                <Label htmlFor="user_name">Your Name (Optional)</Label>
                <Input
                  id="user_name"
                  value={ratingForm.user_name}
                  onChange={(e) => setRatingForm({ ...ratingForm, user_name: e.target.value })}
                  placeholder="Anonymous"
                  className="mt-2"
                  data-testid="rating-name-input"
                />
              </div>

              <div>
                <Label htmlFor="user_email">Your Email (Optional)</Label>
                <Input
                  id="user_email"
                  type="email"
                  value={ratingForm.user_email}
                  onChange={(e) => setRatingForm({ ...ratingForm, user_email: e.target.value })}
                  placeholder="your@email.com"
                  className="mt-2"
                  data-testid="rating-email-input"
                />
              </div>

              <div>
                <Label htmlFor="feedback">Feedback (Optional)</Label>
                <Textarea
                  id="feedback"
                  value={ratingForm.feedback}
                  onChange={(e) => setRatingForm({ ...ratingForm, feedback: e.target.value })}
                  placeholder="Share your thoughts about this prompt..."
                  rows={4}
                  className="mt-2"
                  data-testid="rating-feedback-input"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#F58634] hover:bg-[#d97529]"
                disabled={submitting}
                data-testid="submit-rating-button"
              >
                {submitting ? 'Submitting...' : 'Submit Rating'}
              </Button>
            </form>
          </Card>

          <div data-testid="ratings-list">
            <h2 className="text-2xl font-bold text-[#811622] mb-6" style={{ fontFamily: 'Manrope' }}>User Reviews</h2>
            <div className="space-y-4">
              {ratings.length > 0 ? (
                ratings.map((rating) => (
                  <Card key={rating.id} className="p-6" data-testid={`rating-${rating.id}`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold text-[#811622]">
                          {rating.user_name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-[#53435B]">
                          {new Date(rating.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={16}
                            fill={star <= rating.rating ? '#F58634' : 'none'}
                            className={star <= rating.rating ? 'text-[#F58634]' : 'text-gray-300'}
                          />
                        ))}
                      </div>
                    </div>
                    {rating.feedback && (
                      <p className="text-[#53435B]">{rating.feedback}</p>
                    )}
                  </Card>
                ))
              ) : (
                <Card className="p-6" data-testid="no-ratings">
                  <p className="text-[#53435B] text-center">No reviews yet. Be the first to rate this prompti!</p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptDetail;