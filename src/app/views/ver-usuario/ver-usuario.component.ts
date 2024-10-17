import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirestoreService } from '../../common/services/firestore.service';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonThumbnail, IonContent, IonLabel, IonList, IonItem, IonCard, IonInput, IonSpinner, IonButtons, IonButton, IonIcon, IonImg, IonCardHeader, IonCardContent, IonCardTitle, IonBackButton, IonText } from '@ionic/angular/standalone';
import { CartService } from '../../common/services/cart.service';  // Servicio del carrito
import { CartItem } from '../../common/models/carrito.models';   // Modelo del carrito
import { NavController } from '@ionic/angular';
import { BitlyService } from '../../common/services/bitly.service'; // Asegúrate de que la ruta sea correcta

import { HttpClientModule } from '@angular/common/http';




@Component({
  selector: 'app-ver-usuario',
  standalone: true,
  imports: [IonText,
      HttpClientModule,

    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonLabel,
    IonList,
    IonItem,
    IonCard,
    IonInput,
    IonSpinner,
    IonButtons,
    IonButton,
    IonIcon,
    IonImg,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonBackButton,
    IonThumbnail
  ],
  templateUrl: './ver-usuario.component.html',
  styleUrls: ['./ver-usuario.component.scss'],
})
export class VerUsuarioComponent implements OnInit {
 cartItems: CartItem[] = []; // Lista de items en el carrito
  totalsByCurrency: { [currency: string]: number } = {}; // Totales por moneda
  grandTotal: number = 0; // Gran total de todos los productos

  constructor(private cartService: CartService,private navController: NavController, private firestoreService : FirestoreService,private bitlyService: BitlyService) {}

  ngOnInit() {
    this.cartService.getCart().subscribe(items => {
      this.cartItems = items;
      this.calculateTotals(); // Calcular los totales al iniciar
    });
  }

  // Obtener el nombre del producto (sea buckle, buckleBelt o leatherStrap)
  getProductName(product: any): string {
    return product.modelo || product.fabricDesign || product.cintos;
  }

  // Obtener el símbolo de la moneda (USD, EUR, ARS)
  getCurrencySymbol(currency: string): string {
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'ARS': 'AR$'
    };
    return symbols[currency] || currency;
  }

  // Calcular el subtotal por producto
getSubtotal(item: CartItem): number {
  let price = 0;

  // Verificar el tipo de producto y obtener el precio correspondiente
  if ('price' in item.product) {
    price = Number(item.product.price);  // Convertir a número si es un string
  }

  return price * item.cantidad;
}

  calculateTotals() {
    this.totalsByCurrency = {};
    this.grandTotal = 0;

    this.cartItems.forEach(item => {
        const subtotal = this.getSubtotal(item);
        const currency = item.product.currency; // Supón que cada producto tiene un campo de moneda

        if (!this.totalsByCurrency[currency]) {
            this.totalsByCurrency[currency] = 0;
        }
        this.totalsByCurrency[currency] += subtotal;
    });

    this.grandTotal = Object.values(this.totalsByCurrency).reduce((sum, total) => sum + total, 0);
}

  // Obtener las monedas utilizadas en el carrito
  getCurrencies(totals: { [currency: string]: number }): string[] {
    return Object.keys(totals);
  }

  // Eliminar un producto del carrito
  removeItem(product: any) {
    this.cartService.removeFromCart(product);
    this.calculateTotals();
  }

  // Vaciar el carrito
  clearCart() {
    this.cartService.clearCart();
    this.calculateTotals();
  }



checkout = async () => { // Marcar como async
  const message = await this.createOrderMessage(); // Usa await para obtener el mensaje
  const phoneNumber = '1234567890';
const whatsappUrl = `https://wa.me/${5493492214933}?text=${encodeURIComponent(message)}`;

  window.open(whatsappUrl, '_blank');
}



  // async createOrderMessage(): Promise<string> {
  //   let message = '¡Hola! Aquí está mi pedido:\n\n';
  //   const imageShortUrls = await this.shortenImageUrls();

  //   this.cartItems.forEach((item, index) => {
  //     const productName = this.getProductName(item.product);
  //     const currencySymbol = this.getCurrencySymbol(item.product.currency);
  //     const price = item.product.price;

  //     const imageUrl = imageShortUrls[index];

  //     message += `${productName} - ${currencySymbol}${price} \nImagen disponible (ver en WhatsApp): ${imageUrl}\n\n`;
  //   });

  //   return message;
  // }


  async createOrderMessage(): Promise<string> {
  let message = '¡Hola! Aquí está mi pedido:\n\n';
  const imageShortUrls = await this.shortenImageUrls(); // Acortar las URLs de las imágenes

  this.cartItems.forEach((item, index) => {
    const productName = this.getProductName(item.product);
    const currencySymbol = this.getCurrencySymbol(item.product.currency);
    const price = item.product.price;

    // Usar las URLs acortadas de todas las imágenes del producto
    const images = item.product.imagenesUrl || []; // Obtiene las imágenes del producto
    const shortenedUrls = images.map((url, imgIndex) => imageShortUrls[index][imgIndex]); // URL acortada correspondiente

    // Presentar el mensaje con todas las URLs de imágenes acortadas
    message += `${productName} - ${currencySymbol}${price} \nImágenes disponibles:\n`;
    shortenedUrls.forEach(url => {
      message += `${url}\n`;
    });
    message += '\n'; // Espacio entre productos
  });

  return message;
}


private async shortenImageUrls(): Promise<string[][]> {
  const shortenedUrls: string[][] = [];
  const urlPromises = this.cartItems.map(item => {
    const images = item.product.imagenesUrl || []; // Obtener las imágenes del producto
    return Promise.all(images.map(imageUrl => {
      return this.bitlyService.shortenUrl(imageUrl).toPromise().then(response => response.link);
    })).then(shortenedImageUrls => {
      shortenedUrls.push(shortenedImageUrls); // Almacena el array de URLs acortadas
    });
  });

  await Promise.all(urlPromises);
  return shortenedUrls;
}



  // private async shortenImageUrls(): Promise<string[]> {
  //   const shortenedUrls: string[] = [];
  //   const urlPromises = this.cartItems.map(item => {
  //     const imageUrl = item.product.imagenUrl;
  //     return this.bitlyService.shortenUrl(imageUrl).toPromise().then(response => {
  //       shortenedUrls.push(response.link);
  //     });
  //   });

  //   await Promise.all(urlPromises);
  //   return shortenedUrls;
  // }


irAHome() {
    this.navController.navigateRoot('/home'); // Asegúrate de que '/home' sea la ruta correcta a tu página de inicio
  }



}
