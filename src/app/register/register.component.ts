import { Component, ElementRef } from '@angular/core';
import {NgForm} from '@angular/forms';
import { Headers, Http, Response } from '@angular/http';
import {Observable}       from 'rxjs/Observable';
import { AppState } from '../app.service';
import 'rxjs/add/operator/toPromise';
import {
    CanActivate, Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot
}                           from '@angular/router';
import 'rxjs/Rx';
import {UserService} from "../user.service";
import {WindowRef} from "../WindowRef";
import {PlansComponentService} from "../shopify/mission.service";
declare  var $:any;

@Component({
  host: {
    '(document:click)': 'onClick($event)',
  },
  selector: 'register',

  styleUrls: [ 'register.style.css' ],
  templateUrl: 'register.template.html'
})
export class Register {
  emailError = false;
  submitted = false;
  passwordError = false;
  passwordErrorLabel = false;
  emailErrorLabel = false;
  localState = { email: '' };
  private headers = new Headers({'Content-Type': 'application/json'});
  acceptsMail = true;
  private passwordLabel: any;
  emailLabel: any;
  emailLabelDataError = "Enter valid email";
  passwordLabelDataError = "Use at least 6 characters.";
  // TypeScript public modifiers
  constructor(private eref: ElementRef, private http: Http,
              public appState: AppState, private router: Router, private loginservice: UserService,
              private windowRef: WindowRef,private plansComponentService:PlansComponentService) {


  }

  onClick(event){
    // if (event.target.innerHTML =="Create Account") // or some similar check
    //   $('#modalRegister').openModal();

  }

  openModal(){
    var that = this;
    this.windowRef.nativeWindow.ga('set', { page:'/register',title:'Register'});
    this.windowRef.nativeWindow.ga('send', 'pageview');
    $('#modalRegister').openModal({
      complete: function() {
        that.router.navigate(['/']);
        $(".lean-overlay").remove();
      }
    });
  }


  ngOnInit() {
    this.openModal();
  }

  checkBoxChange(ev){
    this.acceptsMail = ev.currentTarget.checked;
    console.log(ev.currentTarget.checked);
  }

  ngOnDestroy(){
    //console.log('hello `modalRegister` ngOnDestroy');
    this.closeModal();
  }

  closeModal(){
    $(".lean-overlay").remove();
    $('#modalRegister').closeModal();
  }

  submitState(f: NgForm) {
    this.passwordErrorLabel = false;
    this.passwordError = false;
    var firstName = f.value.firstName;
    var email = f.value.email;
    var password = f.value.password;
    var acceptsMail = (this.acceptsMail) ? "true" : "false";


    if(email == ""){
      $('#email').addClass("invalid");
      $('#emailLabel').addClass("active");
      return false;
    }
    if(password == ""){

      this.passwordLabelDataError = "Use at least 6 characters.";
      $('#password').addClass("invalid");
      $('#passwordLabel').addClass("active");
      return false;
    }

    if(!this.validateEmail(email) ){
      $('#email').addClass("invalid");
      $('#emailLabel').addClass("active");
      return false;
    }

    var a = {
      "firstName":f.value.firstName,
      "userEmail":f.value.email,
      "userPassword":f.value.password,
      "acceptsMail":acceptsMail
    };
    var that = this;
    this.windowRef.nativeWindow.startLoadingCursor();

    this.create(a)
      .then(res => {
        // console.log(res);
        that.windowRef.nativeWindow.stopLoadingCursor();
        that.emailErrorLabel = false;
        that.emailError = false;

        if(res.status == "success"){
         // this.closeModal();
          this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'register success', email);
          this.loginservice.loginUser(this.eref, res.user);

          if(this.appState.getExact("changePlan") > 1){
            this.plansComponentService.changePlan(this.appState.getExact("changePlan"));
          } else {
            this.submitted = true; // welcome popup
          }
        }

        if(res.status = "fail"){
          this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'register fail', email);
          if(res.error == "invalid_password"){
            this.windowRef.nativeWindow.ga('send', 'event', 'Site', 'register fail', "invalid_password,"+email);
            that.passwordErrorLabel = true;
            that.passwordError = true;
            that.passwordLabelDataError = "Invalid password, use at least 6 characters.";
          }

          if(res.error == "email_exists"){
            that.emailErrorLabel = true;
            that.emailError = true;
            that.emailLabelDataError = "The email is already registered.";
          }
        }

      });
  }

  create(name: Object): Promise<any> {

    var state = this.appState.get("apiUrl");
    return this.http
      .post(state.apiURL+"/createUser", JSON.stringify(name), {headers: this.headers})
      .toPromise()
      .then(res => res.json())
      .catch(this.handleError);
  }

  validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  private handleError(error: any): Promise<any> {
    console.log('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }
}
