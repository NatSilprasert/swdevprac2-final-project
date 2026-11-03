import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import { apiClient, ApiError } from "@/lib/api-client";
import { clearSession, getToken, getUser, saveSession } from "@/lib/auth-storage";
import type { AuthResponse, LoginInput, RegisterInput, User } from "@/types/auth";

interface AuthState {
  user: User | null;
  /** False until the persisted session has been read on the client. */
  hydrated: boolean;
  status: "idle" | "loading";
  error: string | null;
}

const initialState: AuthState = { user: null, hydrated: false, status: "idle", error: null };

const toUser = ({ id, name, email, role }: AuthResponse): User => ({ id, name, email, role });

const errorMessage = (e: unknown) => (e instanceof ApiError ? e.message : "Something went wrong");

export const login = createAsyncThunk<User, LoginInput, { rejectValue: string }>(
  "auth/login",
  async (input, { rejectWithValue }) => {
    try {
      const data = await apiClient.post<AuthResponse>("/auth/login", input);
      const user = toUser(data);
      saveSession(data.token, user);
      return user;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  }
);

export const register = createAsyncThunk<User, RegisterInput, { rejectValue: string }>(
  "auth/register",
  async (input, { rejectWithValue }) => {
    try {
      const data = await apiClient.post<AuthResponse>("/auth/register", input);
      const user = toUser(data);
      saveSession(data.token, user);
      return user;
    } catch (e) {
      return rejectWithValue(errorMessage(e));
    }
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  try {
    await apiClient.get("/auth/logout");
  } finally {
    // The JWT stays valid server-side until it expires, so always drop it locally.
    clearSession();
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    /** Restore the persisted session. Dispatch once on the client after mount. */
    hydrate(state) {
      state.user = getToken() ? getUser() : null;
      state.hydrated = true;
    },
    /** Called when the API answers 401 so the UI drops the stale session. */
    sessionExpired(state) {
      clearSession();
      state.user = null;
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state: AuthState) => {
      state.status = "loading";
      state.error = null;
    };
    const fulfilled = (state: AuthState, action: PayloadAction<User>) => {
      state.status = "idle";
      state.user = action.payload;
    };
    const rejected = (state: AuthState, action: { payload?: string }) => {
      state.status = "idle";
      state.error = action.payload ?? "Something went wrong";
    };

    builder
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, fulfilled)
      .addCase(login.rejected, rejected)
      .addCase(register.pending, pending)
      .addCase(register.fulfilled, fulfilled)
      .addCase(register.rejected, rejected)
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = "idle";
      })
      .addCase(logout.rejected, (state) => {
        state.user = null;
        state.status = "idle";
      });
  },
});

export const { hydrate, sessionExpired, clearError } = authSlice.actions;
export default authSlice.reducer;
