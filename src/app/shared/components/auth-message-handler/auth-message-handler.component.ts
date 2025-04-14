import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-message-handler',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="hidden"></div>`, // Invisible component
  styles: []
})
export class AuthMessageHandlerComponent implements OnInit {
  constructor(private toastr: ToastrService) {}

  ngOnInit(): void {
    // Check if we have a successful login to show a message for
    if (localStorage.getItem('login_success') === 'true') {
      console.log('Displaying login success message');
      setTimeout(() => {
        this.toastr.success('Login successful');
        localStorage.removeItem('login_success');
      }, 500); // Small delay to ensure page is rendered
    }
    
    // Clean up any pending login flags that might have been left
    localStorage.removeItem('login_pending');
  }
} 