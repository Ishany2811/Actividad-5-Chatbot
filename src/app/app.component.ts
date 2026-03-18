import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService } from './services/chat.service';
import { IMessage } from './Interfaces/imessage';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  chatOpen: boolean = false;
  loading: boolean = false;
  messages: IMessage[] = [];
  userInput: string = '';
  showConfig: boolean = false;
  apiUrl: string = 'https://yulieth2811-electivaIV.hf.space/query';

  constructor(private chatService: ChatService) { }

  ngOnInit() {
    const savedUrl = localStorage.getItem('siaguard_api_url');
    if (savedUrl) this.apiUrl = savedUrl;

    // Escuchar siempre al servicio
    this.chatService.getConversation().subscribe(msgs => {
      this.messages = msgs;
      this.loading = false; // Detenemos el loading cuando llega un mensaje
      this.scrollToBottom();
    });
  }

  sendMessage() {
    if (!this.userInput.trim()) return;
    
    this.loading = true;
    this.chatService.sendMessage(this.userInput);
    this.userInput = ''; // Limpiar input
  }

  toggleChat() {
    this.chatOpen = !this.chatOpen;
    if (this.chatOpen) this.scrollToBottom();
  }

  saveApiConfig() {
    if (this.apiUrl.startsWith('http')) {
      localStorage.setItem('siaguard_api_url', this.apiUrl);
      this.showConfig = false;
      alert('Configuración de enlace actualizada.');
    }
  }

  private scrollToBottom() {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-body');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }

  goToUpta() {
    window.open('https://upta.edu.ve/', '_blank');
  }
}
