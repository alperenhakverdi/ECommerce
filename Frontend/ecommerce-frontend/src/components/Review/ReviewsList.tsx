import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
  Alert,
  AlertIcon,
  Spinner,
  Select,
  useToast,
  Divider,
} from '@chakra-ui/react';
import { Review, ProductReviewStats } from '../../types';
import { reviewsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import ReviewStats from './ReviewStats';

interface ReviewsListProps {
  productId: string;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ productId }) => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ProductReviewStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [hasExistingReview, setHasExistingReview] = useState(false);
  const [existingReview, setExistingReview] = useState<Review | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rating_high' | 'rating_low'>('newest');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const pageSize = 10;

  useEffect(() => {
    fetchInitialData();
  }, [productId, isAuthenticated]);

  useEffect(() => {
    fetchReviews(1, true);
  }, [sortBy]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsResponse = await reviewsApi.getProductStats(productId);
      setStats(statsResponse.data);

      // Check if user can review (only if authenticated)
      if (isAuthenticated) {
        try {
          const canReviewResponse = await reviewsApi.canReview(productId);
          setCanReview(canReviewResponse.data.canReview);
          setHasExistingReview(canReviewResponse.data.hasExistingReview);

          // If user has existing review, fetch it
          if (canReviewResponse.data.hasExistingReview) {
            const existingReviewResponse = await reviewsApi.getUserProductReview(productId);
            setExistingReview(existingReviewResponse.data);
          }
        } catch (error) {
          // User might not have permission or review doesn't exist
          console.log('Could not check review permissions:', error);
        }
      }

      // Fetch reviews
      await fetchReviews(1, true);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load reviews.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchReviews = async (pageNum: number, reset: boolean = false) => {
    try {
      if (pageNum > 1) {
        setLoadingMore(true);
      }

      const response = await reviewsApi.getProductReviews(productId, pageNum, pageSize);
      const newReviews = response.data;

      if (reset) {
        setReviews(newReviews);
        setPage(1);
      } else {
        setReviews(prev => [...prev, ...newReviews]);
      }

      setHasMore(newReviews.length === pageSize);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load reviews.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchReviews(nextPage);
  };

  const handleReviewSuccess = (review: Review) => {
    if (editingReview) {
      // Update existing review in list
      setReviews(prev => prev.map(r => r.id === review.id ? review : r));
      setEditingReview(null);
      setExistingReview(review);
    } else {
      // Add new review to list
      setReviews(prev => [review, ...prev]);
      setCanReview(false);
      setHasExistingReview(true);
      setExistingReview(review);
    }
    
    setShowReviewForm(false);
    
    // Refresh stats
    fetchStats();
  };

  const fetchStats = async () => {
    try {
      const statsResponse = await reviewsApi.getProductStats(productId);
      setStats(statsResponse.data);
    } catch (error) {
      console.error('Failed to refresh stats:', error);
    }
  };

  const handleReviewDelete = (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    setCanReview(true);
    setHasExistingReview(false);
    setExistingReview(null);
    fetchStats();
  };

  const handleEditReview = (review: Review) => {
    setEditingReview(review);
    setShowReviewForm(true);
  };

  const handleCancelForm = () => {
    setShowReviewForm(false);
    setEditingReview(null);
  };

  if (loading) {
    return (
      <VStack spacing={4} py={8}>
        <Spinner size="lg" />
        <Text>Loading reviews...</Text>
      </VStack>
    );
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Review Stats */}
      {stats && <ReviewStats stats={stats} />}

      {/* Review Form */}
      {isAuthenticated && (
        <>
          {canReview && !showReviewForm && (
            <Button
              colorScheme="blue"
              onClick={() => setShowReviewForm(true)}
              alignSelf="flex-start"
            >
              Write a Review
            </Button>
          )}

          {hasExistingReview && !showReviewForm && existingReview && (
            <Alert status="info">
              <AlertIcon />
              <Text>
                You have already reviewed this product.{' '}
                <Button
                  variant="link"
                  colorScheme="blue"
                  size="sm"
                  onClick={() => handleEditReview(existingReview)}
                >
                  Edit your review
                </Button>
              </Text>
            </Alert>
          )}

          {showReviewForm && (
            <ReviewForm
              productId={productId}
              existingReview={editingReview || undefined}
              onSuccess={handleReviewSuccess}
              onCancel={handleCancelForm}
            />
          )}
        </>
      )}

      {!isAuthenticated && stats && stats.totalReviews > 0 && (
        <Alert status="info">
          <AlertIcon />
          <Text>
            Please log in to write a review for this product.
          </Text>
        </Alert>
      )}

      {/* Reviews List */}
      {reviews.length > 0 && (
        <>
          <Divider />
          
          {/* Sort Controls */}
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Reviews ({stats?.totalReviews || 0})
            </Text>
            
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              size="sm"
              maxW="200px"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="rating_high">Highest Rating</option>
              <option value="rating_low">Lowest Rating</option>
            </Select>
          </HStack>

          <VStack spacing={4} align="stretch">
            {reviews.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                onEdit={handleEditReview}
                onDelete={handleReviewDelete}
              />
            ))}
          </VStack>

          {/* Load More */}
          {hasMore && (
            <Button
              variant="outline"
              onClick={handleLoadMore}
              isLoading={loadingMore}
              loadingText="Loading more..."
              alignSelf="center"
            >
              Load More Reviews
            </Button>
          )}
        </>
      )}

      {/* No Reviews State */}
      {reviews.length === 0 && stats && stats.totalReviews === 0 && (
        <Alert status="info">
          <AlertIcon />
          <Text>
            No reviews yet. {isAuthenticated && canReview ? 'Be the first to review this product!' : ''}
          </Text>
        </Alert>
      )}
    </VStack>
  );
};

export default ReviewsList;