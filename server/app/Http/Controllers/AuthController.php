<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'username' => 'required|string|max:255|unique:users',
            'email' => [
                'nullable',
                'string',
                'email',
                'max:255',
                'unique:users',
                'regex:/^[\w\.-]+@[\w\.-]+\.\w{2,}$/'
            ],
            'password' => ['required', 'confirmed'],
            'role_name' => 'required|string|exists:roles,name'
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $role = Role::where('name', $request->role_name)->first();

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role_id' => $role->id,
            'is_active' => true
        ]);

        return response()->json([
            'message' => 'User registered successfully!',
        ], 201);
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!Auth::attempt($credentials)) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 401);
        }

        $user = User::where('email', $request->email)->firstOrFail();

        if (!$user->is_active) {
            return response()->json([
                'message' => 'User account is inactive'
            ], 403);
        }

        $user->last_login_at = now();
        $user->save();

        // Set expiration time (1 days in seconds)
        $expiresIn = 60 * 60 * 24 * 1; // 1 hari dalam detik

        $token = $user->createToken('api-token', ['*'], now()->addSeconds($expiresIn));

        return response()->json([
            'message' => 'Login successfully!',
            'access_token' => $token->plainTextToken,
            'expires_in' => $expiresIn,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load('role');

        return response()->json([
            'id' => $user->id,
            'username' => $user->username,
            'email' => $user->email,
            'role_id' => $user->role_id,
            'role_name' => $user->role->name ?? null,
            'is_active' => $user->is_active,
            'last_login_at' => $user->last_login_at,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
            'deleted_at' => $user->deleted_at,
            'deleted_by' => $user->deleted_by,
        ]);
    }

    /**
     * Create a new user (admin only)
     */
    public function createUser(Request $request)
    {
        $validated = $request->validate([
            'username' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string',
            'role_id' => 'required|exists:roles,id'
        ]);

        $user = User::create([
            'username' => $validated['username'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role_id' => $validated['role_id']
        ]);

        return response()->json([
            'message' => 'User created successfully',
        ], 201);
    }

    /**
     * Update a user (admin only)
     */
    public function updateUser(Request $request, User $user)
    {
        $validated = $request->validate([
            'username' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'password' => 'sometimes|string',
            'role_id' => 'sometimes|exists:roles,id'
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
        ]);
    }

    /**
     * Delete a user (admin only)
     */
    public function deleteUser(User $user)
    {
        $user->delete();
        $user->deleted_by = auth()->user()->id;
        $user->save();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }

    /**
     * Restore a deleted user (admin only)
     */
    public function restoreUser($userId)
    {
        $user = User::withTrashed()->findOrFail($userId);
        $user->restore();

        return response()->json([
            'message' => 'User restored successfully',
        ]);
    }
}
