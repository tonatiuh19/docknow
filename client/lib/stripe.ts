import { loadStripe } from "@stripe/stripe-js";

// Make sure to call `loadStripe` outside of a component's render
// to avoid recreating the `Stripe` object on every render.
const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
    "pk_test_51SZdUKGnfvtfvDArO6TeeonBAF2bA2dzqxT3wwNzxeJQfILmHr6QjjECYyxzGf7uUGSB8r8LWTYiBL5MJjpOkO9l00oyXP6NRL",
);

export { stripePromise };
