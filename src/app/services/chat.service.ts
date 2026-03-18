import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { IMessage } from '../Interfaces/imessage';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private messageArray: IMessage[] = [
    {
      text: 'Sistemas SiaGuard en línea. Protocolos de seguridad activos. ¿En qué puedo ayudarte, Yulieth?',
      sender: 'bot',
      timestamp: new Date()
    }
  ];
  
  private conversation = new BehaviorSubject<IMessage[]>(this.messageArray);

  constructor(private http: HttpClient) {}

  getConversation(): Observable<IMessage[]> {
    return this.conversation.asObservable();
  }

  sendMessage(text: string) {
    // 1. Obtener la URL del localStorage o usar la de HF por defecto
    const HF_API_URL = localStorage.getItem('siaguard_api_url') || 'https://yulieth2811-electivaIV.hf.space/query';

    // 2. Agregar mensaje del usuario a la UI inmediatamente
    const userMsg: IMessage = { text, sender: 'user', timestamp: new Date() };
    this.messageArray.push(userMsg);
    this.conversation.next([...this.messageArray]);

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    // 3. Petición a Hugging Face
    this.http.post<{ intent: string, response: string }>(
      HF_API_URL, 
      { query: text }, 
      { headers }
    )
    .subscribe({
      next: (res) => {
        const botMsg: IMessage = {
          text: res.response || 'Respuesta recibida sin contenido.',
          sender: 'bot',
          timestamp: new Date()
        };
        this.messageArray.push(botMsg);
        this.conversation.next([...this.messageArray]);
      },
      error: (err) => {
        console.error('Error en SIA-AGRO API:', err);
        const errorMsg: IMessage = {
          text: 'Error de enlace: El núcleo SiaGuard reporta una interrupción en el servidor.',
          sender: 'bot',
          timestamp: new Date()
        };
        this.messageArray.push(errorMsg);
        this.conversation.next([...this.messageArray]);
      }
    });
  }
}
