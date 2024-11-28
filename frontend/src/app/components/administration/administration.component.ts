import { Component, inject, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { UsersService } from '../../services/users.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-administration',
  standalone: true,
  imports: [TableModule],
  templateUrl: './administration.component.html',
  styleUrl: './administration.component.css'
})
export class AdministrationComponent implements OnInit{


  users: any[] = []; 
  token: string = ''; 

  private userServive = inject(UserService);

  constructor(private usersService: UsersService) { }

  ngOnInit(): void {
    this.token = this.userServive.getUserToken() ?? ''; // Obtén el token (puedes guardarlo en el almacenamiento local o global)
    console.log(this.token);
    this.getUsers();
  }

  getUsers(): void {
    this.usersService.getUsers(this.token).subscribe(
      (response) => {
        console.log('Usuarios:', response.users);
        this.users = response.users; 
      },
      (error) => {
        console.error('Error al obtener los usuarios:', error);
      }
    );
  }
}
