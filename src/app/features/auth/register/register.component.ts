
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { RegisterRequest, AuthResponse } from '../../../core/models/auth.model';
import { Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['../auth.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  loading = false;
  error = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Rediriger si déjà connecté
    if (this.authService.isAuthenticated()) {
      this.authService.redirectByRole();
    }
  }

  /**
   * Validateur personnalisé pour la confirmation du mot de passe
   */
  passwordMatchValidator(form: AbstractControl): null {
    const password = form.get('motDePasse');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    }
    return null;
  }

  /**
   * Soumission du formulaire d'inscription
   */
  onSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const registerData: RegisterRequest = {
      nom: this.registerForm.value.nom,
      email: this.registerForm.value.email,
      motDePasse: this.registerForm.value.motDePasse,
      role: Role.MEMBRE_EQUIPE // Inscription publique = MEMBRE_EQUIPE uniquement
    };

    this.authService.register(registerData).subscribe({
      next: (response: AuthResponse) => {
        this.loading = false;
        // Redirection automatique après inscription réussie
        this.authService.redirectByRole();
      },
      error: (error: HttpErrorResponse) => {
        this.loading = false;
        // Gestion des différents types d'erreurs
        if (error.error && error.error.message) {
          this.error = error.error.message;
        } else if (error.message) {
          this.error = error.message;
        } else {
          this.error = 'Erreur lors de l\'inscription';
        }
      }
    });
  }

  /**
   * Obtenir les erreurs d'un champ
   */
  getFieldError(fieldName: string): string {
    const field = this.registerForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors['required']) {
        return this.getRequiredMessage(fieldName);
      }
      if (field.errors['email']) {
        return 'Format d\'email invalide';
      }
      if (field.errors['minlength']) {
        return this.getMinLengthMessage(fieldName, field.errors['minlength'].requiredLength);
      }
      if (field.errors['maxlength']) {
        return this.getMaxLengthMessage(fieldName, field.errors['maxlength'].requiredLength);
      }
      if (field.errors['passwordMismatch']) {
        return 'Les mots de passe ne correspondent pas';
      }
    }
    return '';
  }

  private getRequiredMessage(fieldName: string): string {
    const messages: { [key: string]: string } = {
      nom: 'Le nom est requis',
      email: 'L\'email est requis',
      motDePasse: 'Le mot de passe est requis',
      confirmPassword: 'La confirmation du mot de passe est requise'
    };
    return messages[fieldName] || 'Ce champ est requis';
  }

  private getMinLengthMessage(fieldName: string, length: number): string {
    if (fieldName === 'nom') {
      return `Le nom doit contenir au moins ${length} caractères`;
    }
    if (fieldName === 'motDePasse') {
      return `Le mot de passe doit contenir au moins ${length} caractères`;
    }
    return `Ce champ doit contenir au moins ${length} caractères`;
  }

  private getMaxLengthMessage(fieldName: string, length: number): string {
    if (fieldName === 'nom') {
      return `Le nom ne peut pas dépasser ${length} caractères`;
    }
    return `Ce champ ne peut pas dépasser ${length} caractères`;
  }
}
