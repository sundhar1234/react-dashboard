import { useState } from 'react';
import { useDispatch } from 'react-redux';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

import axiosInstance from '../../apiCall';
import { LOGIN, LOGOUT } from '../../redux/reduxSignUp/signInTypes';

export function SignInView() {
  const router = useRouter();
  const dispatch = useDispatch();

  const initialState = {
    email: '',
    password: '',
  };

  const [value, setValue] = useState(initialState);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    setValue({
      ...value,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignIn = async () => {
    try {
      // const response = await axiosInstance.post('', value);
      // const { token, user } = response.data;

      // localStorage.setItem('token', token)
      // dispatch({
      //   type: LOGIN,
      //   payload: { user, token },
      // });
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Invalid credentials');
    }
  };

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h5">Sign in</Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          flexDirection: 'column',
        }}
      >
        <TextField
          fullWidth
          name="email"
          label="Email address"
          value={value.email}
          onChange={handleChange}
          sx={{ mb: 3 }}
          slotProps={{
            inputLabel: { shrink: true },
          }}
        />

        <TextField
          fullWidth
          name="password"
          label="Password"
          value={value.password}
          onChange={handleChange}
          type={showPassword ? 'text' : 'password'}
          slotProps={{
            inputLabel: { shrink: true },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{ mb: 3 }}
        />

        <Link variant="body2" color="inherit" sx={{ mb: 1.5 }}>
          Forgot password?
        </Link>

        <Button
          fullWidth
          size="large"
          type="button"
          color="inherit"
          variant="contained"
          onClick={handleSignIn}
        >
          Sign in
        </Button>
      </Box>
    </>
  );
}
