import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { IMessage } from '../Interfaces/imessage';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  // BehaviorSubject permite que los nuevos suscriptores obtengan el historial actual de inmediato
  private conversation = new BehaviorSubject<IMessage[]>([]);

  constructor(private http: HttpClient) {}

  // Retorna el observable para que el componente lo escuche
  getConversation(): Observable<IMessage[]> {
    return this.conversation.asObservable();
  }

  /**
   * Envía el mensaje a la API de Hugging Face
   * @param userText Texto enviado por el usuario
   */
  async sendMessage(userText: string) {
    // Solo esta línea debe encargarse de mostrar el mensaje del usuario
    this.addMessageToConversation(userText, 'user');
  
    const apiUrl = localStorage.getItem('siaguard_api_url');
    if (!apiUrl) return;
  
    try {
      const res = await this.http.post<{ response: string }>(
        apiUrl, 
        { query: userText }
      ).toPromise();
  
      if (res && res.response) {
        this.addMessageToConversation(res.response, 'bot');
      }
    } catch (error) {
      this.addMessageToConversation('Error de conexión', 'bot');
    }
  }

  /**
   * Método auxiliar para actualizar el historial de mensajes de forma inmutable
   */
  private addMessageToConversation(text: string, sender: 'user' | 'bot') {
    const newMessage: IMessage = {
      text,
      sender,
      timestamp: new Date()
    };
    
    // Tomamos el valor actual y emitimos uno nuevo con el mensaje agregado
    const currentMessages = this.conversation.value;
    this.conversation.next([...currentMessages, newMessage]);
  }
}
