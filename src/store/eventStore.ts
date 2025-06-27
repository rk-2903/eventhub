import { create } from 'zustand';
import { Event, Enrollment } from '../types';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface EventState {
  events: Event[];
  userEnrollments: Enrollment[];
  isLoading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  fetchEventById: (id: string) => Promise<Event | undefined>;
  fetchUserEnrollments: (userId: string) => Promise<void>;
  enrollInEvent: (
    userId: string,
    eventId: string,
    batchId?: string
  ) => Promise<void>;
  cancelEnrollment: (enrollmentId: string) => Promise<void>;
  createEvent: (event: Omit<Event, 'id'>) => Promise<void>;
  updateEvent: (eventId: string, eventData: Partial<Event>) => Promise<void>;
}

const mapEventForDisplay = (event: any): Event => {
  const firstBatch = event.batches?.[0];

  // Get schedule display from first batch
  const scheduleDisplay = firstBatch
    ? {
        date: format(new Date(), 'MMMM dd, yyyy'),
        time: `${firstBatch.start_time.slice(
          0,
          5
        )} - ${firstBatch.end_time.slice(0, 5)}`,
        location: firstBatch.schedule,
      }
    : {
        date: 'Flexible',
        time: 'To be announced',
        location: 'To be announced',
      };

  return {
    id: event.id,
    name: event.name,
    description: event.description,
    organizer_id: event.organizer_id,
    organizerName: event.profiles?.full_name || 'Unknown Organizer',
    event_type: event.event_type,
    price_type: event.price_type,
    base_price: event.base_price,
    min_hours: event.min_hours,
    min_weeks: event.min_weeks,
    min_months: event.min_months,
    created_at: event.created_at,
    updated_at: event.updated_at,
    batches: event.batches,
    discounts: event.discounts,
    // UI display fields
    category:
      event.event_type.charAt(0).toUpperCase() + event.event_type.slice(1),
    date: scheduleDisplay.date,
    time: scheduleDisplay.time,
    location: scheduleDisplay.location,
    capacity: firstBatch?.capacity || 0,
    enrolled: firstBatch?.enrolled || 0,
    imageUrl: getEventImage(event.event_type),
  };
};

const getEventImage = (eventType: string): string => {
  const images = {
    regular:
      'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg',
    intermediate:
      'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg',
    advanced:
      'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg',
    summer:
      'https://images.pexels.com/photos/3184302/pexels-photo-3184302.jpeg',
  };
  return images[eventType as keyof typeof images] || images.regular;
};

// UUID validation regex pattern
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  userEnrollments: [],
  isLoading: false,
  error: null,

  fetchEvents: async () => {
    set({ isLoading: true, error: null });
    const user = supabase.auth.admin;
    console.log('Authenticated user:', user);
    try {
      console.log('Try to fetch event');
      const { data: events, error } = await supabase.from('events').select(`
          *
        `);

      console.log('data ', events);
      console.log('Error:', error);

      if (error) throw error;

      const mappedEvents = events.map((event) => mapEventForDisplay(event));
      set({ events: mappedEvents, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to fetch events',
        isLoading: false,
      });
    }
  },

  fetchEventById: async (id: string) => {
    set({ isLoading: true, error: null });

    try {
      const { data: event, error } = await supabase
        .from('events')
        .select(
          `
          *,
          profiles (id, full_name),
          batches (*),
          discounts (*)
        `
        )
        .eq('id', id)
        .single();

      if (error) throw error;

      set({ isLoading: false });
      return mapEventForDisplay(event);
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch event',
        isLoading: false,
      });
    }
  },

  fetchUserEnrollments: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      // Validate UUID format
      if (!UUID_PATTERN.test(userId)) {
        throw new Error('Invalid user ID format. Expected UUID.');
      }

      const { data: enrollments, error } = await supabase
        .from('registrations')
        .select(
          `
          *,
          event:events (
            *,
            profiles (id, full_name),
            batches (*)
          )
        `
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedEnrollments = enrollments.map((enrollment) => ({
        ...enrollment,
        event: enrollment.event
          ? mapEventForDisplay(enrollment.event)
          : undefined,
      }));

      set({ userEnrollments: mappedEnrollments, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch enrollments',
        isLoading: false,
      });
    }
  },

  enrollInEvent: async (userId: string, eventId: string, batchId?: string) => {
    set({ isLoading: true, error: null });

    try {
      // Validate UUID format
      if (!UUID_PATTERN.test(userId)) {
        throw new Error('Invalid user ID format. Expected UUID.');
      }

      const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (!event) throw new Error('Event not found');

      const { data: registration, error } = await supabase
        .from('registrations')
        .insert({
          user_id: userId,
          event_id: eventId,
          batch_id: batchId,
          status: 'pending',
          start_date: new Date().toISOString(),
          end_date: new Date(
            new Date().setMonth(new Date().getMonth() + 1)
          ).toISOString(),
          total_amount: event.base_price,
          final_amount: event.base_price,
        })
        .select()
        .single();

      if (error) throw error;

      if (batchId) {
        const { error: batchError } = await supabase.rpc(
          'increment_batch_enrollment',
          {
            p_batch_id: batchId,
          }
        );

        if (batchError) throw batchError;
      }

      set((state) => ({
        userEnrollments: [...state.userEnrollments, registration],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to enroll in event',
        isLoading: false,
      });
    }
  },

  cancelEnrollment: async (enrollmentId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { error } = await supabase
        .from('registrations')
        .update({ status: 'cancelled' })
        .eq('id', enrollmentId);

      if (error) throw error;

      set((state) => ({
        userEnrollments: state.userEnrollments.map((enrollment) =>
          enrollment.id === enrollmentId
            ? { ...enrollment, status: 'cancelled' }
            : enrollment
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to cancel enrollment',
        isLoading: false,
      });
    }
  },

  createEvent: async (eventData: Omit<Event, 'id'>) => {
    set({ isLoading: true, error: null });

    try {
      const { data: event, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;

      const mappedEvent = mapEventForDisplay(event);
      set((state) => ({
        events: [...state.events, mappedEvent],
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to create event',
        isLoading: false,
      });
    }
  },

  updateEvent: async (eventId: string, eventData: Partial<Event>) => {
    set({ isLoading: true, error: null });

    try {
      const { data: event, error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      const mappedEvent = mapEventForDisplay(event);
      set((state) => ({
        events: state.events.map((e) => (e.id === eventId ? mappedEvent : e)),
        isLoading: false,
      }));
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to update event',
        isLoading: false,
      });
    }
  },
}));