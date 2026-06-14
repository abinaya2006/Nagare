#include<stdio.h>
void main(){
    int r1,r2,c1,c2;
    printf("Rows and columns of A:\n");
    scanf("%d%d",&r1,&c1);
    printf("Rows and columns of B:\n");
    scanf("%d%d",&r2,&c2);

    if(c1!=r2)
        printf("Matrix Multiplication is invalid");

    else
    {
        int a[r1][c1],b[r2][c2];
        int m[r1][c2],s=0;
        printf("Enter the elements of matrix A:\n");
        for (int i=0;i<r1;i++)
        {
            for(int j=0;j<c1;j++)
                scanf("%d",&a[i][j]);
        }
    
        printf("Enter the elements of matrix B:\n");
        for (int i=0;i<r2;i++)
        {
            for(int j=0;j<c2;j++)
                scanf("%d",&b[i][j]);
            
        }

        printf("\nMatrix A:\n");
        for (int i=0;i<r1;i++)
        {
            for(int j=0;j<c1;j++)
                printf("%d ",a[i][j]);
            
            printf("\n");
        }
        

        printf("\nMatrix B:\n");
        for (int i=0;i<r2;i++)
        {
            for(int j=0;j<c2;j++)
                printf("%d ",b[i][j]);
        
            printf("\n");
        }

        //matrix multiplication:
        for (int i=0;i<r1;i++)
        {   
            for(int j=0;j<c2;j++){
                s=0;
                for (int k=0;k<c1;k++){
                    s+=a[i][k]*b[k][j];
                }
                m[i][j]=s;
            }
        }
        
        printf("\nA*B:\n");
        for (int i=0;i<r1;i++)
        {
            for(int j=0;j<c2;j++)
                printf("%d ",m[i][j]);
            
            printf("\n");
        }
    }
    



}