import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { palette, shadows, spacing, radius, typography } from '@/constants/theme';
import { surveyService } from '@/services/api';
import { analyticsService } from '@/services/analytics.service';

const { width } = Dimensions.get('window');

interface SurveyModalProps {
  visible: boolean;
  onClose: () => void;
}

const QUESTIONS = [
  {
    key: 'overallRating',
    title: 'Đánh giá chung',
    description: 'Bạn thấy ứng dụng SPA Parking nói chung thế nào?',
    type: 'rating',
  },
  {
    key: 'usabilityRating',
    title: 'Dễ dàng tìm bãi đỗ',
    description: 'Việc tìm kiếm và xem thông tin bãi đỗ xe có thuận tiện không?',
    type: 'rating',
  },
  {
    key: 'bookingRating',
    title: 'Đặt chỗ & Check-in',
    description: 'Quy trình đặt chỗ đỗ xe và quét mã check-in thế nào?',
    type: 'rating',
  },
  {
    key: 'uiRating',
    title: 'Giao diện & Độ mượt',
    description: 'Thiết kế, màu sắc và tốc độ phản hồi của ứng dụng?',
    type: 'rating',
  },
  {
    key: 'comment',
    title: 'Đóng góp ý kiến',
    description: 'Bạn có đề xuất gì để ứng dụng hữu ích hơn không?',
    type: 'text',
  },
];

export function SurveyModal({ visible, onClose }: SurveyModalProps) {
  const [step, setStep] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>({
    overallRating: 0,
    usabilityRating: 0,
    bookingRating: 0,
    uiRating: 0,
  });
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  // Ghi nhận sự kiện khi mở form khảo sát
  useEffect(() => {
    if (visible) {
      setStep(0);
      setRatings({
        overallRating: 0,
        usabilityRating: 0,
        bookingRating: 0,
        uiRating: 0,
      });
      setComment('');
      setCompleted(false);
      analyticsService.logEvent('survey_modal_opened');
    }
  }, [visible]);

  const currentQuestion = QUESTIONS[step];

  const handleNext = () => {
    if (currentQuestion.type === 'rating' && ratings[currentQuestion.key] === 0) {
      // Bắt buộc phải chọn đánh giá rating mới đi tiếp
      return;
    }
    
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
      analyticsService.logEvent('survey_next_step', { step: step + 1 });
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const selectRating = (value: number) => {
    setRatings((prev) => ({
      ...prev,
      [currentQuestion.key]: value,
    }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const sessionDuration = analyticsService.getCurrentSessionDuration();
      const lastScreen = analyticsService.getCurrentScreen();

      const payload = {
        overallRating: ratings.overallRating,
        usabilityRating: ratings.usabilityRating,
        bookingRating: ratings.bookingRating,
        uiRating: ratings.uiRating,
        comment: comment.trim() || undefined,
        appVersion: '1.0.0',
        deviceOS: Platform.OS,
        sessionDurationSeconds: sessionDuration,
        lastVisitedScreen: lastScreen,
      };

      // Gửi lên Backend
      await surveyService.submitSurvey(payload);

      // Log lên Firebase Analytics
      await analyticsService.logEvent('submit_survey', {
        overall_rating: ratings.overallRating,
        usability_rating: ratings.usabilityRating,
        booking_rating: ratings.bookingRating,
        ui_rating: ratings.uiRating,
        has_comment: !!payload.comment,
        session_duration: sessionDuration,
      });

      setCompleted(true);
      analyticsService.logEvent('survey_modal_completed');
      
      // Đóng modal sau 2 giây cảm ơn
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Lỗi khi gửi khảo sát:', error);
      alert('Có lỗi xảy ra khi gửi khảo sát. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const progress = ((step + 1) / QUESTIONS.length) * 100;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.overlay} />
        
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Đóng góp ý kiến</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={palette.textSecondary} />
            </TouchableOpacity>
          </View>

          {completed ? (
            <View style={styles.successContainer}>
              <View style={styles.successIconWrapper}>
                <Ionicons name="checkmark-circle" size={80} color={palette.success} />
              </View>
              <Text style={styles.successTitle}>Cảm ơn bạn!</Text>
              <Text style={styles.successSubtitle}>
                Ý kiến đóng góp của bạn giúp chúng tôi nâng cấp SPA Parking ngày một tốt hơn.
              </Text>
            </View>
          ) : (
            <>
              {/* Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
              </View>
              
              <Text style={styles.stepIndicator}>
                Câu hỏi {step + 1} / {QUESTIONS.length}
              </Text>

              {/* Question Details */}
              <View style={styles.questionContainer}>
                <Text style={styles.questionTitle}>{currentQuestion.title}</Text>
                <Text style={styles.questionDescription}>{currentQuestion.description}</Text>

                {/* Rating Input */}
                {currentQuestion.type === 'rating' && (
                  <View style={styles.ratingWrapper}>
                    {[1, 2, 3, 4, 5].map((val) => {
                      const isSelected = ratings[currentQuestion.key] >= val;
                      return (
                        <TouchableOpacity
                          key={val}
                          onPress={() => selectRating(val)}
                          activeOpacity={0.7}
                          style={styles.starButton}
                        >
                          <Ionicons
                            name={isSelected ? 'star' : 'star-outline'}
                            size={44}
                            color={isSelected ? palette.warning : palette.border}
                          />
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* Text Input */}
                {currentQuestion.type === 'text' && (
                  <TextInput
                    style={styles.commentInput}
                    placeholder="Hãy viết gì đó tại đây..."
                    placeholderTextColor={palette.textMuted}
                    multiline
                    numberOfLines={4}
                    value={comment}
                    onChangeText={setComment}
                  />
                )}
              </View>

              {/* Footer Actions */}
              <View style={styles.footer}>
                {step > 0 ? (
                  <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Text style={styles.backButtonText}>Quay lại</Text>
                  </TouchableOpacity>
                ) : (
                  <View />
                )}

                <TouchableOpacity
                  onPress={handleNext}
                  disabled={submitting || (currentQuestion.type === 'rating' && ratings[currentQuestion.key] === 0)}
                  style={[
                    styles.nextButton,
                    (currentQuestion.type === 'rating' && ratings[currentQuestion.key] === 0) && styles.nextButtonDisabled,
                  ]}
                >
                  {submitting ? (
                    <ActivityIndicator color={palette.white} size="small" />
                  ) : (
                    <Text style={styles.nextButtonText}>
                      {step === QUESTIONS.length - 1 ? 'Hoàn thành' : 'Tiếp tục'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  modalContent: {
    width: width - spacing.lg * 2,
    backgroundColor: palette.darkBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#FFFFFF10',
    padding: spacing.lg,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    color: palette.white,
    ...typography.h2,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#FFFFFF10',
    borderRadius: 2,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: palette.success,
  },
  stepIndicator: {
    color: palette.textMuted,
    ...typography.caption,
    marginBottom: spacing.xs,
  },
  questionContainer: {
    minHeight: 180,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  questionTitle: {
    color: palette.white,
    ...typography.h1,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  questionDescription: {
    color: palette.textSecondary,
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.sm,
  },
  ratingWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing.md,
  },
  starButton: {
    padding: spacing.xs,
  },
  commentInput: {
    width: '100%',
    height: 110,
    backgroundColor: '#FFFFFF0A',
    borderRadius: radius.md,
    color: palette.white,
    padding: spacing.md,
    textAlignVertical: 'top',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#FFFFFF15',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  backButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  backButtonText: {
    color: palette.textSecondary,
    ...typography.label,
  },
  nextButton: {
    backgroundColor: palette.white,
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    minWidth: 120,
  },
  nextButtonDisabled: {
    backgroundColor: '#FFFFFF40',
  },
  nextButtonText: {
    color: palette.black,
    ...typography.label,
    fontWeight: 'bold',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  successIconWrapper: {
    marginBottom: spacing.md,
  },
  successTitle: {
    color: palette.white,
    ...typography.hero,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  successSubtitle: {
    color: palette.textSecondary,
    ...typography.body,
    textAlign: 'center',
    paddingHorizontal: spacing.md,
  },
});
