import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="privacy-container">
      <h2>Privacy Policy</h2>
      <section>
        <h3>Introduction</h3>
        <p>Welcome to MoodMunch! We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our website and services.</p>
      </section>

      <section>
        <h3>Information We Collect</h3>
        <p>We may collect the following types of information:</p>
        <ul>
          <li><strong>Personal Information:</strong> When you create an account, we collect your username and email address.</li>
          <li><strong>Usage Data:</strong> We collect information about how you interact with MoodMunch, such as the recipes you view, search queries, and preferences like mood selections.</li>
          <li><strong>Shopping List Data:</strong> If you add ingredients to your shopping list, we store this information to help you manage your cooking needs.</li>
          <li><strong>Cookies:</strong> We use cookies to maintain your session and enhance your experience.</li>
        </ul>
      </section>

      <section>
        <h3>How We Use Your Information</h3>
        <p>Your information is used to:</p>
        <ul>
          <li>Provide personalized recipe recommendations based on your mood and preferences.</li>
          <li>Manage your account and shopping list.</li>
          <li>Improve our services through analytics and user feedback.</li>
          <li>Communicate with you, such as responding to inquiries sent to support&#64;moodmunch.com.</li>
        </ul>
      </section>

      <section>
        <h3>Data Sharing</h3>
        <p>We do not sell or share your personal information with third parties, except:</p>
        <ul>
          <li>With service providers (e.g., Spoonacular API) to fetch recipe data on your behalf.</li>
          <li>As required by law or to protect our rights.</li>
        </ul>
      </section>

      <section>
        <h3>Data Security</h3>
        <p>We implement reasonable security measures to protect your data, such as encryption for sensitive information and secure authentication. However, no system is completely secure, and we cannot guarantee absolute protection.</p>
      </section>

      <section>
        <h3>Your Choices</h3>
        <p>You can:</p>
        <ul>
          <li>Update or delete your account by contacting us at support&#64;moodmunch.com.</li>
          <li>Opt out of cookies via your browser settings, though this may affect functionality.</li>
        </ul>
      </section>

      <section>
        <h3>Changes to This Policy</h3>
        <p>We may update this Privacy Policy from time to time. Changes will be posted here, effective as of March 27, 2025, or the date of the update.</p>
      </section>

      <section>
        <h3>Contact Us</h3>
        <p>If you have questions about this Privacy Policy, reach out to us at <a href="mailto:support&#64;moodmunch.com">support&#64;moodmunch.com</a>.</p>
      </section>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.Eager,
  styles: [`
    .privacy-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      text-align: left;
    }
    h2 {
      color: #FF3008;
      text-align: center;
      margin-bottom: 20px;
    }
    h3 {
      color: #FF3008;
      margin-top: 20px;
      font-size: 1.5em;
    }
    p {
      line-height: 1.6;
      color: #666;
      margin-bottom: 15px;
    }
    ul {
      list-style: none;
      padding-left: 20px;
      margin-bottom: 15px;
    }
    li {
      position: relative;
      margin-bottom: 10px;
      padding-left: 15px;
    }
    li:before {
      content: "•";
      color: #FF3008;
      position: absolute;
      left: 0;
    }
    a {
      color: #FF3008;
      text-decoration: none;
    }
    a:hover {
      text-decoration: underline;
    }
  `]
})
export class PrivacyComponent {
}
