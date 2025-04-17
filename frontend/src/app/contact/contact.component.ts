import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="contact-container">
      <h2>Contact Us</h2>
      <p>Email: <a href="mailto:support&#64;moodmunch.com">support&#64;moodmunch.com</a></p>
    </div>
  `,
  styles: [`
    .contact-container { max-width: 800px; margin: 20px auto; padding: 20px; text-align: center; }
    h2 { color: #FF3008; }
  `]
})
export class ContactComponent {

}
