import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../core/services/user.service';
import { User, Role } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-create',
  templateUrl: './user-create.component.html',
  styleUrls: ['./user-create.component.scss']
})
export class UserCreateComponent implements OnInit {
  userForm: FormGroup;
  loading = false;
  error = '';

  // Enum pour le template
  Role = Role;

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router
  ) {
    this.userForm = this.formBuilder.group({
      nom: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      role: [Role.MEMBRE_EQUIPE, [Validators.required]]
    });
  }

  ngOnInit(): void {}

  /**
   * Soumission du formulaire
   */
  onSubmit(): void {
    if (this.userForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    const userData: User = this.userForm.value;

    this.userService.createUser(userData).subscribe({
      next: () => {
        this.router.navigate(['/admin/users']);
      },
      error: (error) => {
        this.loading = false;
        this.error = error.message || 'Erreur lors de la création de l\'utilisateur';
      }
    });
  }

  /**
   * Annuler et retourner à la liste
   */
  cancel(): void {
    this.router.navigate(['/admin/users']);
  }

  /**
   * Obtenir les erreurs d'un champ
   */
  getFieldError(fieldName: string): string {
    const field = this.userForm.get(fieldName);
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
    }
    return '';
  }

  private getRequiredMessage(fieldName: string): string {
    const messages: { [key: string]: string } = {
      nom: 'Le nom est requis',
      email: 'L\'email est requis',
      motDePasse: 'Le mot de passe est requis',
      role: 'Le rôle est requis'
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

  /**
   * Obtenir le libellé du rôle
   */
  getRoleLabel(role: Role): string {
    switch (role) {
      case Role.ADMIN:
        return 'Administrateur';
      case Role.CHEF_DE_PROJECT:
        return 'Chef de Projet';
      case Role.MEMBRE_EQUIPE:
        return 'Membre d\'équipe';
      default:
        return role;
    }
  }
}
