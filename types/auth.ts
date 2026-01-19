// types/auth.ts
import type { User as FirebaseUser } from "firebase/auth";
import type { DocumentData } from "firebase/firestore";
import type { User } from "./index";

export interface AuthUser extends FirebaseUser {
  customData?: User | null;
}

export interface SigninFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface FormErrors {
  email?: string;
  password?: string;
  name?: string;
  confirmPassword?: string;
  terms?: string;
  general?: string;
}

export interface AuthState {
  // User state
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Form state
  currentTab: "signin" | "signup";
  signinForm: SigninFormData;
  signupForm: SignupFormData;

  // Loading states
  isSigningIn: boolean;
  isSigningUp: boolean;
  isGoogleAuth: boolean;
  isSigningOut: boolean;

  // Error states
  signinErrors: FormErrors;
  signupErrors: FormErrors;
  generalError: string | null;
}

export interface AuthActions {
  // User actions
  setUser: (user: AuthUser | null) => void;
  signin: (
    email: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<void>;
  signup: (formData: Omit<SignupFormData, "confirmPassword">) => Promise<void>;
  googleAuth: () => Promise<void>;
  signOut: () => Promise<void>;

  //update actions
  updateUserData: (userData: any) => void;
  
  // Form actions
  setCurrentTab: (tab: "signin" | "signup") => void;
  updateSigninForm: (field: keyof SigninFormData, value: any) => void;
  updateSignupForm: (field: keyof SignupFormData, value: any) => void;

  // Error actions
  setSigninErrors: (errors: FormErrors) => void;
  setSignupErrors: (errors: FormErrors) => void;
  setGeneralError: (error: string | null) => void;
  clearErrors: () => void;
  clearForms: () => void;

  // Validation actions
  validateSigninForm: () => boolean;
  validateSignupForm: () => boolean;
  validateSigninField: (field: keyof SigninFormData, value: any) => boolean;
  validateSignupField: (field: keyof SignupFormData, value: any) => boolean;
}

export type AuthStore = AuthState & AuthActions;

// Helper type for Firebase user with custom data
export interface FirebaseUserWithData extends FirebaseUser {
  customData: DocumentData | null;
}
