
/*C program called recurse.c that computes f(N), 
where N is an integer greater than zero that is 
input to the program on the command line. 
f(N) = 2*N + f(N-1) - 1. The base case is f(0)=2.*/

#include <stdio.h>
#include <stdlib.h>
int formula(int num){
    if(num==0){
        return 2;
    }
    else{
        return 2*num+formula(num-1)-1;
    }
    
}
int main(int argc, char *argv[]) {
if (argc != 2) {
    printf("Syntax: ./recurse <NUM>\n");
    return EXIT_SUCCESS;
    }
    int num ;
   if (sscanf(argv[1], "%d", &num) != 1) {
    printf("Syntax: ./recurse <NUM>\n");
    return EXIT_SUCCESS;
  }
  if (num<0) {
    printf("Enter number >= 0");
    return EXIT_SUCCESS;
  }
  int ans=formula(num);
printf("%d\n",ans);
return EXIT_SUCCESS;
}