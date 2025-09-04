import { z } from 'zod';
import { useForm } from '@/hooks/use-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form } from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

// Define the form schema using Zod
const signupSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(8, 'Пароль должен содержать минимум 8 символов'),
  confirmPassword: z.string().min(8, 'Подтвердите пароль'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type SignupFormData = z.infer<typeof signupSchema>;

export function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  
  const {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleBlur,
    setFieldError,
    validate,
  } = useForm<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate(signupSchema)) {
      return;
    }

    try {
      // Here you would typically make an API call to sign up the user
      // For example:
      // const response = await fetch('/api/auth/signup', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values),
      // });
      // const data = await response.json();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Успешная регистрация!',
        description: 'Вы успешно зарегистрированы в системе.',
      });
      
      // Redirect to dashboard or login page
      router.push('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      setFieldError('email', 'Ошибка при регистрации. Пожалуйста, попробуйте снова.');
      toast({
        title: 'Ошибка',
        description: 'Не удалось зарегистрироваться. Пожалуйста, проверьте введенные данные.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="Введите ваш email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.email}
        required
      />
      
      <Input
        label="Пароль"
        name="password"
        type="password"
        placeholder="Введите пароль"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.password}
        required
      />
      
      <Input
        label="Подтвердите пароль"
        name="confirmPassword"
        type="password"
        placeholder="Повторите пароль"
        value={values.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        error={errors.confirmPassword}
        required
      />
      
      <div className="pt-2">
        <Button 
          type="submit" 
          className="w-full"
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          Зарегистрироваться
        </Button>
      </div>
    </Form>
  );
}
